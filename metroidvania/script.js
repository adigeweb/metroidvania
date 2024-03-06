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
var bulletCD = 0;
var currentX = 100;
var activePaper = "";
var touchedItem = "";
var movable = true;

setInterval(() => {
    frame += 10;
}, 10);

const objects = {
    character: document.querySelector("#character"),
    ground: document.querySelector("#primary.ground"),
    background: document.querySelector("#background"),
    background2: document.querySelector("#background2"),
    background3: document.querySelector("#background3")
}

const conditions = {
    jumping: false,
    rightCol: false,
    leftCol: false,
    bottomCol: false,
    topCol: false
}

const keyInputs = {};

const paperTexts = {
    "instructions": `
    A / Left Arrow --> Left Movement
    D / Right Arrow --> Right Movement
    Space --> Jump
    Left Click --> Green Bullet
    Right Click --> Red Bullet
    E --> Super???
    -----------------------------
    Esc --> Close this message
    Reloading the page restarts the game!
    `,
    "outta-dark": "11-01-06-11-05-06 (convert to text)"
}

const onclicks = {
    password: () => {
        var pw = document.querySelector(".prompt input").value;
        if (pw.toLowerCase() == "kafkef") {
            if (document.querySelector("#wall6")) {
                document.querySelector("#wall6").remove();
                document.querySelector(".prompt h3#error").style.display = "none";
                document.querySelector(".prompt h3#success").style.display = "block";
            }
        }
        else {
            document.querySelector(".prompt h3#error").style.display = "block";
            document.querySelector(".prompt h3#success").style.display = "none";
        }
    }
}

const startUp = () => {
    character.style.left = "100px";
    character.style.bottom = "500px";
    background.style.left = "-0px";
    background2.style.left = `${background.getBoundingClientRect().width}px`;
    background3.style.left = `${background.getBoundingClientRect().width + background2.getBoundingClientRect().width}px`;
    objects.ground.style.left = "0px";
    document.querySelectorAll(".scroll *").forEach(item => {
        item.style.left = `${item.getAttribute("data-pos").split(",")[0]}${item.getAttribute("data-pos").split(",")[0] != "auto" ? "px" : ""}`;
        item.style.bottom = `${item.getAttribute("data-pos").split(",")[1]}${item.getAttribute("data-pos").split(",")[1] != "auto" ? "px" : ""}`;
        item.style.width = `${item.getAttribute("data-scale").split(",")[0]}${item.getAttribute("data-scale").split(",")[0] != "auto" ? "px" : ""}`;
        item.style.height = `${item.getAttribute("data-scale").split(",")[1]}${item.getAttribute("data-scale").split(",")[1] != "auto" ? "px" : ""}`;
        item.style.background = item.getAttribute("data-color");
    });
    document.addEventListener("keydown", (event) => {
        keyInputs[event.keyCode] = true;
    });
    document.addEventListener("keyup", (event) => {
        keyInputs[event.keyCode] = false;
    });
    document.addEventListener("click", () => {
        if (event.target.getAttribute("clickable")) {
            if (event.target.getAttribute("data-type") == "page") {
                paperVisibility(event.target.id, 1, paperTexts[event.target.id]);
            }
            return;
        };
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
                document.querySelector(".blue-box").innerHTML = "";
            }, 2000);
            superBullet.style.display = "block";
            document.body.appendChild(superBullet);
        }
    });
    window.addEventListener("keydown", (event) => {
        if (event.key == "F5") window.open(location.href);
        if (event.key == "Escape" && activePaper) paperVisibility(activePaper, 0); 
    });
    document.querySelector(".game-over .restart").addEventListener("click", () => {
        location.reload();
    });
    document.body.addEventListener("mousemove", (event) => {
        if (document.querySelector(".darken").style.display == "none") return;
        document.querySelector(".lighten").style.left = `${event.clientX - 75}px`;
        document.querySelector(".lighten").style.top = `${event.clientY - 75}px`;
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
    if ((keyInputs[37] || keyInputs[65]) && !conditions.leftCol && numerize(character.style.left) > 0 && movable) {
        if (direction == 1) {
            character.style.transform = "scaleX(-1)";
            character.style.left = increase(character.style.left, -110);
            direction = -1;
        }
        if (conditions.rightCol) return;
        currentX -= 2;
        if (numerize(background.style.left) == 0) {
            character.style.left = increase(character.style.left, -2);
        }
        else {
            document.querySelectorAll(".scroll *").forEach(item => {
                item.style.left = increase(item.style.left, parseInt(item.getAttribute("data-sc-coeff")));
            });
            document.querySelectorAll(".backgrounds *").forEach(item => {
                item.style.left = increase(item.style.left, 1);
            });
        }
    }
    if ((keyInputs[39] || keyInputs[68]) && movable) {
        if (direction == -1) {
            character.style.transform = "scaleX(1)";
            character.style.left = increase(character.style.left, 110);
            direction = 1;
        }
        if (conditions.rightCol) return;
        currentX += 2;
        if (numerize(character.style.left) < screen.width / 2 - character.getBoundingClientRect().width / 2) {
            character.style.left = increase(character.style.left, 2);
        }
        else {
            document.querySelectorAll(".scroll *").forEach(item => {
                item.style.left = increase(item.style.left, -1 * parseInt(item.getAttribute("data-sc-coeff")));
            });
            document.querySelectorAll(".backgrounds *").forEach(item => {
                item.style.left = increase(item.style.left, -1);
            });
        }
    }
    if (conditions.leftCol && !conditions.bottomCol && numerize(character.style.left) < numerize(touchedItem.style.left)) {
        character.style.left = increase(character.style.left, -1);
    }
    conditions.leftCol = false;
    conditions.rightCol = false;
    conditions.bottomCol = false;
    document.querySelectorAll(".scroll [col]").forEach(item => {
        if (touches(item, character)) {
            if (item.getBoundingClientRect().left <= character.getBoundingClientRect().left + character.getBoundingClientRect().width) {
                conditions.rightCol = true;
                touchedItem = item;
            }
            if (item.getBoundingClientRect().right >= character.getBoundingClientRect().left - character.getBoundingClientRect().width) {
                conditions.leftCol = true;
                touchedItem = item;
            }
            if (character.getBoundingClientRect().top == item.getBoundingClientRect().top - character.getBoundingClientRect().height) {
                conditions.bottomCol = true;
                conditions.rightCol = false;
                conditions.leftCol = false;
                touchedItem = item;
            }
            if (item.id == "wall2" && document.querySelector(".scroll #wall3")) {
                spawnSkool = true;
                document.querySelector(".scroll #wall3").style.display = "block";
            }
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
                if (wall.id = "wall3") {
                    movable = false;
                    document.querySelector(".overlight").style.opacity = "0";
                    document.querySelector(".overlight").style.display = "block";
                    document.querySelector(".overlight").style.opacity = "1";
                    movable = false;
                    setTimeout(() => {
                        document.querySelector(".overlight").style.opacity = "0";
                        setTimeout(() => {
                            document.querySelector(".overlight").style.display = "none";
                            movable = true;
                        }, 1000);
                    }, 4500);
                }
            });
            document.querySelectorAll(".monster").forEach(mob => {
                if (touches(item, mob)) {
                    mob.remove();
                }
            })
        });
    }
    if (currentX > 4500 && currentX < 5900) {
        document.querySelector(".darken").style.display = "block";
        document.querySelector(".lighten").style.display = "block";
    }
    else if (document.querySelector(".darken").style.display == "block") {
        document.querySelector(".darken").style.display = "none";
        document.querySelector(".lighten").style.display = "none";
    }
    if (currentX == 7000) {
        clearTypewrite();
        typewrite("Is there someone here?", 300);
    }
    if (currentX == 9000) {
        clearTypewrite();
        typewrite("I dont't have much time. Someone, help me!", 300);
    }
    if (currentX == 11000) {
        clearTypewrite();
        typewrite("PLEASE HELP ME!", 750, "red");
    }
    document.querySelectorAll("[data-type=healer]").forEach(item => {
        if (touches(item, character)) {
            var healPoints = item.getAttribute("data-points");
            item.remove();
            healUp(healPoints);
        }
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
        var y = 250 + [0, 250, 500][Math.floor(Math.random() * 3)];
        mob.style.left = "90%";
        mob.style.bottom = `${y}px`;
        health.style.left = "91%";
        health.style.bottom = `${y + 150}px`;
        mob.id = "skool";
        container.setAttribute("data-force", "1");
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
    if (health < 1) health = 1;
    document.querySelector("#health-bar").src = `assets/hearts/heart${health.toString()}.png`;
    if (health == 1) gameOver();
}

const healUp = (hp = 1) => {
    health += hp;
    if (health > 11) health = 11;
    document.querySelector("#health-bar").src = `assets/hearts/heart${health.toString()}.png`;
}

const gameOver = () => {
    document.querySelector(".game-over").style.display = "block";
}

const paperVisibility = (id, type, text = "") => {
    if (!document.querySelector(`.page#${id}`)) return;
    document.querySelector(`.page#${id}`).style.display = ["none", "flex"][type];
    document.querySelector(`.page#${id}`).innerText = text;
    if (type == 1) {
        activePaper = id;
        document.querySelector(`.page#${id}`).style.opacity = "1";
    }
    else {
        document.querySelector(`.page#${id}`).style.opacity = "0";
    }
}

const modalVisibility = (box, type) => {
    box.style.display = ["none", "flex"][type];
}

var typing = null;
var isTyping = false;

const typewrite = (text, delay, color = "black") => {
    if (isTyping) return;
    isTyping = true;
    document.querySelector("#typewrite").style.color = color;
    let i = 0;
    typing = setInterval(() => {
        document.querySelector("#typewrite").textContent += text[i];
        i++;
        if (i == text.length) {
            clearInterval(typing);
            isTyping = false;
        }
    }, delay);
}

const clearTypewrite = () => {
    document.querySelector("#typewrite").textContent = "";
    isTyping = false;
    if (typing) clearInterval(typing);
}

document.querySelectorAll(".close").forEach(item => {
    item.addEventListener("click", () => {
        modalVisibility(item.parentElement, 0);
        movable = true;
    });
});

document.querySelector(".prompt button").addEventListener("click", () => {
    onclicks.password();
});

document.querySelector("#password-button[data-type=button]").addEventListener("click", () => {
    modalVisibility(document.querySelector(".prompt"), 1);
    movable = false;
});

startUp();
setInterval(game, 5);