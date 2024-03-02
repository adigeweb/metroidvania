const numerize = (str) => {
    return (
        str.endsWith("px") ?
        parseInt(str.replace("px", "")) :
        (
            str.endsWith("%") ? parseInt(str.replace("%", "")) : str
        )
    );
}

const increase = (str, n) => {
    return (`${numerize(str) + n}px`);
}

var frame = 0;
var direction = 1;
var health = 11;
var spawnSkool = false;
var tasks = [false];

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
        item.style.width = `${item.getAttribute("data-scale").split(",")[0]}px`;
        item.style.height = `${item.getAttribute("data-scale").split(",")[1]}px`;
        item.style.background = item.getAttribute("data-color");
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
        bullet.style.bottom = increase(character.style.bottom, character.getBoundingClientRect().height * (2 / 3));
        var bulletMove = setInterval(() => {
            bullet.style.left = increase(bullet.style.left, 25 * direction);
        });
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
        bullet.style.bottom = increase(character.style.bottom, character.getBoundingClientRect().height * (2 / 3));
        var bulletMove = setInterval(() => {
            bullet.style.left = increase(bullet.style.left, 25 * direction);
        });
        setTimeout(() => {
            bullet.remove();
            clearInterval(bulletMove);
        }, 1000);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key == "e") {
            if (!document.querySelector(".blue-box[filled]")) return;
            var superBullet = document.createElement("div");
            superBullet.id = "bullet-blue";
            var superInterval = setInterval(() => {
                superBullet.style.left = increase(character.style.left, character.getBoundingClientRect().width - 3);
                superBullet.style.bottom = increase(character.style.bottom, character.getBoundingClientRect().height * (2 / 3) + 7.5);
            }, 10);
            document.querySelectorAll(".super-load *").forEach(box => {
                box.removeAttribute("filled");
            }),
            setTimeout(() => {
                clearInterval(superInterval);
                superBullet.remove();
            }, 2000);
            superBullet.style.display = "block";
            document.body.appendChild(superBullet);
        }
    });
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
        if (direction == 1) {
            character.style.transform = "scaleX(-1)";
            character.style.left = increase(character.style.left, -134);
            direction = -1;
        }
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
        }
    }
    if ((keyInputs[39] || keyInputs[68]) && !conditions.rightCol) {
        if (direction == -1) {
            character.style.transform = "scaleX(1)";
            character.style.left = increase(character.style.left, 134);
            direction = 1;
        }
        if (numerize(character.style.left) < screen.width / 2 - character.getBoundingClientRect().width / 2) {
            character.style.left = increase(character.style.left, 2);
        }
        else {
            document.querySelectorAll(".scroll *").forEach(item => {
                item.style.left = increase(item.style.left, -1 * parseInt(item.getAttribute("data-sc-coeff")));
            });
            document.querySelectorAll("[id^=background]").forEach(item => {
                item.style.left = increase(item.style.left, -1);
            });
        }
    }
    document.querySelectorAll(".scroll [col]").forEach(item => {
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
            if (item.id = "wall2") spawnSkool = true;
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
    if (frame % 4000 == 0 && spawnSkool && !tasks[0]) {
        spawn(`skool-${["red", "green"][Math.floor(Math.random() * 2)]}`, 30);
    }
    document.querySelectorAll("[id ^= bullet]").forEach(item => {
        document.querySelectorAll(".monster").forEach(monster => {
            if (touches(item, monster.querySelector("img"))) {
                if (item.id.split("-")[1] == monster.getAttribute("data-color")) {
                    if (document.querySelectorAll(`.${item.id.split("-")[1]}-box:not([filled])`)[0]) {
                        document.querySelectorAll(`.${item.id.split("-")[1]}-box:not([filled])`)[0].setAttribute("filled", "true");
                        if (document.querySelectorAll(".green-box:not([filled]), .red-box:not([filled])").length == 0) {
                            document.querySelector(".blue-box").setAttribute("filled", "true");
                            document.querySelector(".blue-box").innerHTML = "<i class=\"fa fa-star\"></i>";
                            tasks[0] = true;
                            spawnSkool = false;
                        }
                    }
                    dealDamage(monster, 10);
                    item.remove();
                }
            }
        })
    });
    if (frame % 50 == 0) {
        document.querySelectorAll(".monster[data-force]").forEach(item => {
            item.querySelector("img").style.left = `${numerize(item.querySelector(".health").style.left) - parseInt(item.getAttribute("data-force")) / 10000}%`;
            item.querySelector(".health").style.left = `${numerize(item.querySelector(".health").style.left) - parseInt(item.getAttribute("data-force")) / 10000}%`;
            if (item.querySelector(".health").getBoundingClientRect().left <= 0) {
                item.remove();
            }
        });
    }
    document.querySelectorAll(".monster").forEach(item => {
        if (touches(item.querySelector("img"), character)) {
            takeDamage();
            item.remove();
        }
    });
    if (document.querySelector("#bullet-blue")) {
        document.querySelectorAll("#bullet-blue").forEach(item => {
            document.querySelectorAll("[sup-br]").forEach(wall => {
                if (touches(item, wall)) {
                    wall.remove();
                }
            });
            document.querySelectorAll(".monster").forEach(mob => {
                if (touches(item, mob)) {
                    mob.remove();
                }
            })
        });
    }
}

const spawn = (char, hp) => {
    var container = document.createElement("div");
    container.classList.add("monster");
    container.setAttribute("data-color", char.split("-")[1]);
    container.setAttribute("data-health", hp);
    container.setAttribute("data-max", hp);
    var mob = document.createElement("img");
    mob.src = `assets/${char}.gif`;
    mob.class = "monster";
    var health = document.createElement("div");
    health.classList.add("health");
    health.style.position = "absolute";
    container.appendChild(mob);
    container.appendChild(health);
    mob.style.position = "absolute";
    container.setAttribute("data-sc-coeff", "2");
    var y;
    if (char.startsWith("skool-")) {
        var y = 200 + Math.floor(Math.random() * (window.innerHeight - 325));
        mob.style.left = "90%";
        mob.style.bottom = `${y}px`;
        health.style.left = "91%";
        health.style.bottom = `${y + 150}px`;
        mob.id = "skool";
        container.setAttribute("data-force",
            Math.floor(Math.random() * 4) + 1
        );
    }
    container.setAttribute("data-pos", `${window.innerWidth},${y}`);
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

const takeDamage = (hp = 1) => {
    health -= hp;
    document.querySelector("#health-bar").src = `assets/hearts/heart${health.toString()}.png`;
    if (health == 0) {
        alert("yenildin ama henüz kaybetme ekranı yok. :)");
    }
}

startUp();
setInterval(game, 5);