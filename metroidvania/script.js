const numerize = (str) => {
    return (parseInt(str.replace("px", "")));
}

const increase = (str, n) => {
    return (`${numerize(str) + n}px`);
}

var frame = 0;

setInterval(() => {
    frame += 10;
}, 10);

const objects = {
    character: document.querySelector("#character"),
    ground: document.querySelector("#primary.ground"),
    background: document.querySelector("#background"),
    background2: document.querySelector("#background2")
}

const conditions = {
    jumping: false,
    rightCol: false,
    leftCol: false,
    bottomCol: false,
    topCol: false
}

const keyInputs = {};

const startUp = () => {
    character.style.left = "100px";
    character.style.bottom = "500px";
    background.style.left = "-0px";
    background2.style.left = `${background.getBoundingClientRect().width}px`;
    objects.ground.style.left = "0px";
    document.querySelectorAll(".scroll *").forEach(item => {
        item.style.left = `${item.getAttribute("data-pos").split(",")[0]}px`;
        item.style.bottom = `${item.getAttribute("data-pos").split(",")[1]}px`;
    })
    document.addEventListener("keydown", (event) => {
        keyInputs[event.keyCode] = true;
    });
    document.addEventListener("keyup", (event) => {
        keyInputs[event.keyCode] = false;
    });
    document.addEventListener("click", (event) => {
        let bullet = document.createElement("div");
        bullet.id = "bullet-green";
        document.body.appendChild(bullet);
        bullet.style.left = increase(character.style.left, character.getBoundingClientRect().width);
        bullet.style.bottom = increase(character.style.bottom, character.getBoundingClientRect().height);
        var bulletMove = setInterval(() => {
            bullet.style.left = increase(bullet.style.left, (event.clientX - numerize(bullet.style.left)) * .05);
            bullet.style.bottom = increase(bullet.style.bottom, (window.innerHeight - numerize(bullet.style.bottom) - event.clientY - bullet.style.height / 2) * .05);
        });
        character.src = "assets/char-trigger.gif";
        setTimeout(() => {
            character.src = "assets/character.png";
        }, 500);
        setTimeout(() => {
            bullet.remove();
            clearInterval(bulletMove);
        }, 1000);
    });
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        let bullet = document.createElement("div");
        bullet.id = "bullet-red";
        document.body.appendChild(bullet);
        bullet.style.left = increase(character.style.left, character.getBoundingClientRect().width);
        bullet.style.bottom = increase(character.style.bottom, character.getBoundingClientRect().height);
        var bulletMove = setInterval(() => {
            bullet.style.left = increase(bullet.style.left, (event.clientX - numerize(bullet.style.left)) * .05);
            bullet.style.bottom = increase(bullet.style.bottom, (window.innerHeight - numerize(bullet.style.bottom) - event.clientY - bullet.style.height / 2) * .05);
        });
        character.src = "assets/char-trigger.gif";
        setTimeout(() => {
            character.src = "assets/character.png";
        }, 500);
        setTimeout(() => {
            bullet.remove();
            clearInterval(bulletMove);
        }, 1000);
    });
    document.querySelector("#secondary.ground").style.left = `${screen.innerWidth}px`;
}

const jump = () => {
    conditions.jumping = true;
    setTimeout(() => {
        conditions.jumping = false;
    }, 250);
}

const touches = (a, b) => {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
  
    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}

const game = () => {
    if (numerize(character.style.bottom) > 150 && !conditions.jumping && !conditions.bottomCol) {
        character.style.bottom = increase(character.style.bottom, -5);
    }
    if (conditions.jumping) {
        character.style.bottom = increase(character.style.bottom, 5);
    }
    if (keyInputs[32] && (numerize(character.style.bottom) == 150 || conditions.bottomCol)) jump();
    if ((keyInputs[37] || keyInputs[65]) && !conditions.leftCol) {
        character.src = "assets/char-walk.gif";
        character.style.transform = "scaleX(-1)";
        if (numerize(background.style.left) == 0) {
            character.style.left = increase(character.style.left, -2);
        }
        else {
            document.querySelectorAll(".scroll *").forEach(item => {
                item.style.left = increase(item.style.left, parseInt(item.getAttribute("data-sc-coeff")));
            });
            document.querySelectorAll("[id^='background']").forEach(item => {
                item.style.left = increase(item.style.left, 1);
            });
            document.querySelector("#primary.ground").style.left = increase(document.querySelector("#primary.ground").style.left, 2);
            document.querySelector("#secondary.ground").style.left = increase(document.querySelector("#secondary.ground").style.left, 2);
        }
    }
    if ((keyInputs[39] || keyInputs[68]) && !conditions.rightCol) {
        character.src = "assets/char-walk.gif";
        character.style.transform = "scaleX(1)";
        if (numerize(character.style.left) < screen.width / 2 - character.getBoundingClientRect().width / 2) {
            character.style.left = increase(character.style.left, 2);
        }
        else {
            document.querySelectorAll(".scroll *").forEach(item => {
                item.style.left = increase(item.style.left, -1 * parseInt(item.getAttribute("data-sc-coeff")));
            });
            document.querySelectorAll("[id^='background']").forEach(item => {
                item.style.left = increase(item.style.left, -1);
            });
            document.querySelector("#primary.ground").style.left = increase(document.querySelector("#primary.ground").style.left, -2);
            document.querySelector("#secondary.ground").style.left = increase(document.querySelector("#secondary.ground").style.left, -2);
        }
    }
    document.querySelectorAll("[col]").forEach(item => {
        if (touches(item, character)) {
            if (item.getBoundingClientRect().left <= character.getBoundingClientRect().left + character.getBoundingClientRect().width) {
                conditions.rightCol = true;
            }
            if (item.getBoundingClientRect().right >= character.getBoundingClientRect().left - character.getBoundingClientRect().width) {
                conditions.leftCol = true;
            }
            if (character.getBoundingClientRect().top == item.getBoundingClientRect().top - character.getBoundingClientRect().height) {
                conditions.bottomCol = true;
                conditions.rightCol = false;
                conditions.leftCol = false;
            }
        }
        else {
            conditions.rightCol = false;
            conditions.leftCol = false;
            conditions.bottomCol = false;
        }
    });
    document.querySelectorAll("#ground").forEach(item => {
        if (item.getBoundingClientRect().right > item.getBoundingClientRect().width) {
            item.style.left = `${screen.innerWidth}px`;
        }
    });
    if (frame % 20000 == 0) {
        spawn(`skool-${["red", "green"][Math.floor(Math.random() * 2)]}`, 30);
    }
    document.querySelectorAll("[id ^= bullet]").forEach(item => {
        document.querySelectorAll(".monster").forEach(monster => {
            if (touches(item, monster.querySelector("img")) && (monster.getAttribute("data-color") == item.id.split("-")[1])) {
                if (monster.getAttribute("data-cd")) return;
                document.querySelectorAll(`.${item.id.split("-")[1]}-box:not([filled])`)[0].setAttribute("filled", "true");
                if (document.querySelectorAll(".green-box:not([filled]), .red-box:not([filled])").length == 0) {
                    document.querySelector(".blue-box").setAttribute("filled", "true");
                    document.querySelector(".blue-box").innerHTML = "<i class=\"fa fa-star\"></i>"
                }
                dealDamage(monster, 10);
                item.remove();
            }
        })
    });
}

const spawn = (char, hp) => {
    var container = document.createElement("div");
    container.classList.add("monster");
    container.setAttribute("data-color", char.split("-")[1]);
    container.setAttribute("data-health", hp);
    container.setAttribute("data-max", hp);
    var mob = document.createElement("img");
    mob.src = `assets/${char}.gif`;
    mob.id = "skool";
    mob.class = "monster";
    var health = document.createElement("div");
    health.classList.add("health");
    health.style.position = "absolute";
    container.appendChild(mob);
    container.appendChild(health);
    mob.style.position = "absolute";
    if (char.startsWith("skool-")) {
        var y = 150 + Math.floor(Math.random() * (window.innerHeight - 325));
        mob.style.left = "90%";
        mob.style.bottom = `${y}px`;
        health.style.left = "91%";
        health.style.bottom = `${y + 150}px`;
    }
    document.body.appendChild(container);
}

const dealDamage = (mob, hp) => {
    mob.setAttribute("data-health",
        (parseInt(mob.getAttribute("data-health")) - hp).toString()
    );
    mob.querySelector(".health").style.background = `
        linear-gradient(to right, limegreen 0 ${mob.getAttribute("data-health") / (mob.getAttribute("data-max") / 100)}%, red ${mob.getAttribute("data-health") / (mob.getAttribute("data-max") / 100)}% 100%)
    `;
    if (parseInt(mob.getAttribute("data-health")) <= 0) mob.remove();
}

startUp();
setInterval(game, 5);