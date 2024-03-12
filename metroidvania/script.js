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
var spawnAntipoison = false;
var tasks = [false, false, false, false];
var bulletCD = 0;
var currentX = 100;
var activePaper = "";
var touchedItem = "";
var movable = true;
var shootable = true;
var antipoisonCount = 0;
var menuOpen = true;
var frameListing = true;
var activeFrame = 1;
var skoolSpawnPos = [0, 250, 500];
var spawnDoembly = false;
var blueGateHits = 0;

setInterval(() => {
    frame += 10;
}, 10);

const objects = {
    character: document.querySelector("#character"),
    ground: document.querySelector("#primary.ground"),
    background: document.querySelector("#background"),
    background2: document.querySelector("#background2"),
    background3: document.querySelector("#background3"),
    background4: document.querySelector("#background4"),
}

const sounds = {
    menu: "Relaxing_Interlude.ogg",
    ingame: "IWalkedInTheRainToday.mp3",
    fight: "fight.wav",
    die: "Icy_Game_Over.mp3",
    alarm: "alarm.wav",
    darkness: "Something_is_near.mp3"
}

Object.keys(sounds).forEach(item => {
    sounds[item] = new Audio(`assets/${sounds[item]}`);
    sounds[item].volume = .2;
});

document.querySelector(".tap-for-music").addEventListener("click", () => {
    sounds["menu"].loop = true;
    sounds["menu"].play();
    document.querySelector(".tap-for-music").remove();
});

window.addEventListener("keydown", (event) => {
    if (event.key == "F5") window.open(location.href);
});

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

const loadFrame = (n) => {
    if (activeFrame > 4) {
        clearFrames();
        if (!movable) movable = true;
        if (!shootable) shootable = true;
        return;
    }
    document.querySelector("#frame-overlay").style.display = "block";
    activeFrame++;
    movable = false;
    shootable = false;
    document.querySelector("#frame-overlay").style.background = `url("assets/frames/frame-${n}.png") no-repeat fixed center`;
}

const clearFrames = () => {
    movable = true;
    document.querySelector("#frame-overlay").style.background = "transparent";
    document.querySelector("#frame-overlay").style.display = "none";
}

const startUp = () => {
    sounds["menu"].pause();
    sounds["ingame"].loop = true;
    sounds["ingame"].play();
    character.style.left = "100px";
    character.style.bottom = "500px";
    background.style.left = "-0px";
    background2.style.left = `${background.getBoundingClientRect().width}px`;
    background3.style.left = `${background.getBoundingClientRect().width + background2.getBoundingClientRect().width - 5}px`;
    background4.style.left = `${background.getBoundingClientRect().width + background2.getBoundingClientRect().width + background3.getBoundingClientRect().width - 10}px`;
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
        if (!shootable || document.querySelector(".bullet-fill").getAttribute("data-filled") == "0") return;
        let bullet = document.createElement("div");
        bullet.id = "bullet-green";
        document.body.appendChild(bullet);
        bullet.style.left = increase(character.style.left, character.getBoundingClientRect().width);
        bullet.style.bottom = increase(character.style.bottom, character.getBoundingClientRect().height * (2 / 3));
        document.querySelector(".bullet-fill").setAttribute("data-filled",
            parseInt(document.querySelector(".bullet-fill").getAttribute("data-filled")) <= 0 ?
            document.querySelector(".bullet-fill").getAttribute("data-filled") :
            (parseInt(document.querySelector(".bullet-fill").getAttribute("data-filled")) - 1).toString()
        );
        document.querySelector(".bullet-fill").style.border = `${document.querySelector(".bullet-fill").getAttribute("data-filled") * 2}px solid orangered`;
        var bulletMove = setInterval(() => {
            bullet.style.left = increase(bullet.style.left, 20 * direction);
        });
        setTimeout(() => {
            bullet.remove();
            clearInterval(bulletMove);
        }, 1000);
    });
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (!shootable || document.querySelector(".bullet-fill").getAttribute("data-filled") == "0") return;
        let bullet = document.createElement("div");
        bullet.id = "bullet-red";
        document.body.appendChild(bullet);
        bullet.style.left = increase(character.style.left, character.getBoundingClientRect().width);
        bullet.style.bottom = increase(character.style.bottom, character.getBoundingClientRect().height * (2 / 3));
        document.querySelector(".bullet-fill").setAttribute("data-filled",
            parseInt(document.querySelector(".bullet-fill").getAttribute("data-filled")) <= 0 ?
            document.querySelector(".bullet-fill").getAttribute("data-filled") :
            (parseInt(document.querySelector(".bullet-fill").getAttribute("data-filled")) - 1).toString()
        );
        document.querySelector(".bullet-fill").style.border = `${document.querySelector(".bullet-fill").getAttribute("data-filled") * 2}px solid orangered`;
        var bulletMove = setInterval(() => {
            bullet.style.left = increase(bullet.style.left, 20 * direction);
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
    loadFrame(1);
    window.addEventListener("keydown", (event) => {
        if (event.key == "Escape" && activePaper) paperVisibility(activePaper, 0);
    });
    window.addEventListener("keyup", (event) => {
        if (event.key == "Enter" && frameListing) loadFrame(activeFrame);
    })
    document.querySelector(".game-over .restart").addEventListener("click", () => {
        window.open(location.href);
        location.reload();
    });
    document.body.addEventListener("mousemove", (event) => {
        if (document.querySelector(".darken").style.display == "none") return;
        document.querySelector(".lighten").style.left = `${event.clientX - 75}px`;
        document.querySelector(".lighten").style.top = `${event.clientY - 75}px`;
    });
    document.querySelector("#main-menu").style.display = "none";
    menuOpen = false;
    setInterval(game, 5);
}

document.querySelector("#main-menu #menu-play-button").addEventListener("click", () => {
    if (menuOpen) {
        startUp();
    }
});

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
    if (conditions.rightCol && !conditions.bottomCol && numerize(character.style.left) > numerize(touchedItem.style.left)) {
        character.style.left = increase(character.style.left, 1);
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
            if (item.id == "wall2" && document.querySelector(".scroll #wall3") && !tasks[0]) {
                if (item.getAttribute("data-pressed")) return;
                item.setAttribute("data-pressed", "true");
                movable = false;
                sounds["ingame"].pause();
                sounds["alarm"].play();
                setTimeout(() => {
                    movable = true;
                    spawnSkool = true;
                    sounds["ingame"].pause();
                    sounds["fight"].loop = true;
                    sounds["fight"].play();
                    document.querySelector(".scroll #wall3").style.display = "block";
                }, 1000);
            }
            if (item.id.startsWith("poison")) {
                takeDamage(10);
            }
            if (item.id == "wall4") {
                skoolSpawnPos = [250, 350, 450];
                spawnSkool = true;
                sounds["ingame"].pause();
                sounds["fight"].play();
            }
        }
    });
    document.querySelectorAll("#ground").forEach(item => {
        if (item.getBoundingClientRect().right > item.getBoundingClientRect().width) {
            item.style.left = `${screen.innerWidth}px`;
        }
    });
    if (frame % 4000 == 0 && spawnSkool && ((!tasks[0] && currentX < 3000) || (!tasks[1] && currentX > 3500)) && !menuOpen) {
        spawn(`skool-${["red", "green"][Math.floor(Math.random() * 2)]}`, 30);
    }
    if (frame % 4000 == 0 && spawnAntipoison && tasks[2]) {
        var elem = document.createElement("div");
        elem.id = "antipoison";
        elem.style.left = `${50 + Math.floor(Math.random() * (window.innerWidth - 100))}px`;
        elem.style.top = `${150 + Math.floor(Math.random() * (window.innerHeight - 300))}px`;
        elem.setAttribute("data-sc-coeff", "2");
        document.querySelector(".scroll").appendChild(elem);
    }
    if (frame % 4000 == 0 && spawnDoembly && !tasks[3] && currentX > 16000) {
        spawn(`doembly-${["red", "green"][Math.floor(Math.random() * 2)]}`, 50);
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
                            sounds["fight"].pause();
                            sounds["ingame"].play();
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
                    if (wall.getAttribute("triple-sup-br")) {
                        blueGateHits++;
                        editBlink(`Objective: Break the gate with 3 supers! (${blueGateHits}/3)`)
                        if (blueGateHits == 3) {
                            wall.remove();
                            document.querySelector("#blink").style.color = "gold";
                        }
                    }
                    else wall.remove();
                }
                if (wall.id == "wall3" || wall.id == "wall5-6") {
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
    if (currentX > 5250 && currentX < 14250) {
        document.querySelector(".darken").style.display = "block";
        document.querySelector(".darken").style.opacity = "1";
        document.querySelector(".lighten").style.display = "block";
        sounds["ingame"].pause();
        sounds["darkness"].loop = true;
        sounds["darkness"].play();
    }
    else if (document.querySelector(".darken").style.display == "block") {
        document.querySelector(".darken").style.opacity = "0";
        setTimeout(() => {
            document.querySelector(".darken").style.display = "none";
        }, 1000);
        document.querySelector(".lighten").style.display = "none";
        sounds["darkness"].pause();
        if (sounds["fight"].paused) sounds["ingame"].play();
    }
    if (currentX == 7500) {
        skoolSpawnPos = [];
        clearTypewrite();
        typewrite("Is there someone here?", 150, "white");
    }
    if (currentX == 9000) {
        clearTypewrite();
        typewrite("I don't have much time. Someone, help me!", 150, "white");
    }
    if (currentX == 11000) {
        clearTypewrite();
        typewrite("PLEASE HELP ME!", 375, "red");
    }
    if (currentX == 14250 && !tasks[2]) {
        tasks[2] = true;
        clearTypewrite();
        clearBlink();
        blink("Objective: Grab the antipoisons to survive Bocu! (0/20)");
        sounds["alarm"].play();
        setTimeout(() => {
            spawnAntipoison = true;
            sounds["ingame"].pause();
            sounds["fight"].play();
        }, 1000);
    }
    if (currentX == 16000) {
        if (spawnDoembly) return;
        movable = false;
        clearTypewrite();
        typewrite("Something is approaching...", 150);
        setTimeout(() => {
            clearTypewrite();
            typewrite("Something white...", 150);
            setTimeout(() => {
                clearTypewrite();
                typewrite("Something weird...", 150);
                setTimeout(() => {
                    movable = true;
                    sounds["ingame"].pause();
                    sounds["fight"].play();
                    blink("Objective: Break the gate with 3 supers! (0/3)");
                    spawnDoembly = true;
                }, 2700);
            }, 2700);
        }, 4050);
    }
    document.querySelectorAll("[data-type=healer]").forEach(item => {
        if (touches(item, character)) {
            var healPoints = item.getAttribute("data-points");
            item.remove();
            healUp(healPoints);
        }
    });
    if (document.querySelector("#antipoison")) {
        document.querySelectorAll("#antipoison").forEach(item => {
            if (touches(item, character)) {
                item.remove();
                antipoisonCount++;
                if (antipoisonCount == 20) {
                    spawnAntipoison = false;
                    document.querySelector("#blink").style.color = "gold";
                    sounds["fight"].pause();
                    sounds["ingame"].play();
                    setTimeout(() => {
                        document.querySelector(".overlight").style.opacity = "0";
                        document.querySelector(".overlight").style.display = "block";
                        document.querySelector(".overlight").style.opacity = "1";
                        movable = false;
                        document.querySelector("#wall11").remove();
                        clearBlink();
                        document.querySelector("#typewrite").style.top = "25px";
                        document.querySelector("#typewrite").style.transform = "translateX(-50%)";
                        typewrite("Thanks for saving me!", 150);
                        typewrite("I got to go now!..", 200);
                        document.querySelector("#typewrite").style.top = "40%";
                        document.querySelector("#typewrite").style.transform = "translate(-50%, -50%)";
                        setTimeout(() => {
                            document.querySelector("#velet").remove();
                            document.querySelector(".overlight").style.opacity = "0";
                            setTimeout(() => {
                                document.querySelector(".overlight").style.display = "none";
                                clearTypewrite();
                                movable = true;
                            }, 1000);
                            document.querySelector("#blink").style.color = "black";
                        }, 4500);
                    }, 1500);
                }
                editBlink(`Objective: Grab the antipoisons to survive Bocu! (${antipoisonCount}/20)`);
            }
        });
    }
    if (currentX > screen.width / 2 && numerize(character.style.left) != screen.width / 2 && direction == 1) {
        character.style.left = `${screen.width / 2}px`;
    }
    if (frame % 1000 == 0) {
        document.querySelector(".bullet-fill").setAttribute("data-filled",
            parseInt(document.querySelector(".bullet-fill").getAttribute("data-filled")) >= 3 ?
            document.querySelector(".bullet-fill").getAttribute("data-filled") :
            (parseInt(document.querySelector(".bullet-fill").getAttribute("data-filled")) + 1).toString()
        );
        document.querySelector(".bullet-fill").style.border = `${document.querySelector(".bullet-fill").getAttribute("data-filled") * 2}px solid orangered`;
    }
    if (document.querySelector(".monster#doembly")) {
        document.querySelectorAll(".monster#doembly").forEach(item => {
            var ball = document.createElement("div");
            ball.classList.add("doballs");
        });
    }
    if (document.querySelector(".doballs")) {
        document.querySelectorAll(".doballs").forEach(item => {
            item.style.left = increase(item.style.left, -3);
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
        var y = 250 + skoolSpawnPos[Math.floor(Math.random() * skoolSpawnPos.length)];
        mob.style.left = "90%";
        mob.style.bottom = `${y}px`;
        health.style.left = "91%";
        health.style.bottom = `${y + 150}px`;
        mob.id = "skool";
        container.setAttribute("data-force", "1");
    }
    else if (char.startsWith("doembly-")) {
        mob.style.left = "85%";
        mob.style.bottom = `150px`;
        health.style.left = "91%";
        health.style.bottom = `450px`;
        mob.id = "doembly";
        container.setAttribute("data-force", "1");
        mob.style.height = "200px";
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
    sounds["fight"].pause();
    sounds["ingame"].pause();
    sounds["darkness"].pause();
    sounds["die"].play();
    shootable = false;
    movable = false;
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

const blink = (text) => {
    document.querySelector("#blink").style.display = "block";
    document.querySelector("#blink").innerText = text;
    var blinking = setInterval(() => {
        if (document.querySelector("#blink").style.opacity == "1") {
            document.querySelector("#blink").style.opacity = "0";
        }
        else {
            document.querySelector("#blink").style.opacity = "1";
        }
    }, 500);
    setTimeout(() => {
        clearInterval(blinking);
        document.querySelector("#blink").style.opacity = "1";
    }, 2000);
}

const clearBlink = () => {
    document.querySelector("#blink").innerText = "";
    document.querySelector("#blink").style.display = "none";
}

const editBlink = (text) => {
    document.querySelector("#blink").innerText = text;
    var blinking = setInterval(() => {
        if (document.querySelector("#blink").style.opacity == "1") {
            document.querySelector("#blink").style.opacity = "0";
        }
        else {
            document.querySelector("#blink").style.opacity = "1";
        }
    }, 250);
    setTimeout(() => {
        clearInterval(blinking);
        document.querySelector("#blink").style.opacity = "1";
    }, 1250);
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