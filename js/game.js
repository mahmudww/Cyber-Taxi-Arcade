/* ========================================
   CYBER TAXI — GAME
   ======================================== */

import {
    player,
    obstacles,
    powerups,
    particles,
    movePlayer as entityMovePlayer,
    updatePlayerMovement,
    createParticles,
    updateParticles,
    resetEntities
} from "./entities.js";

import {
    initAudio,
    stopEngineSound,
    stopBGM,
    playSound
} from "./audio.js";


/* ========================================
   CANVAS
   ======================================== */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const container =
    document.getElementById("game-container");

const controls =
    document.querySelector(".mobile-controls");


/* ========================================
   GAME STATE
   ======================================== */

let isPlaying = false;

let score = 0;

let gameSpeed = 4.5;

let roadOffset = 0;

let spawnTimer = 0;

let screenShakeTimer = 0;

let turboActive = false;

let powerupTimer = 0;

let activePowerupName = "READY";


/* ========================================
   RESIZE
   ======================================== */

function resizeCanvas() {

    canvas.width =
        container.clientWidth;

    canvas.height =
        container.clientHeight -
        controls.offsetHeight;

}


/* ========================================
   LANES
   ======================================== */

function getLanes() {

    const center =
        canvas.width / 2;

    return [
        center - 75,
        center,
        center + 75
    ];

}


/* ========================================
   MOVE PLAYER
   ======================================== */

function movePlayer(direction) {

    if (!isPlaying) {
        return;
    }


    const moved =
        entityMovePlayer(direction);


    if (!moved) {
        return;
    }


    playSound("move");


    const lanes =
        getLanes();


    createParticles(
        lanes[player.lane],
        player.y + 42,
        "#00ffcc",
        6
    );

}


/* ========================================
   KEYBOARD CONTROLS
   ======================================== */

window.addEventListener(
    "keydown",
    (event) => {

        if (!isPlaying) {
            return;
        }


        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            movePlayer(-1);

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            movePlayer(1);

        }

    }
);


/* ========================================
   START GAME
   ======================================== */

function startGame() {

    initAudio();

    resizeCanvas();

    resetEntities();


    score = 0;

    gameSpeed = 4.5;

    roadOffset = 0;

    spawnTimer = 0;

    screenShakeTimer = 0;

    turboActive = false;

    powerupTimer = 0;

    activePowerupName =
        "READY";


    player.lane = 1;

    player.visualLane = 1;

    player.moveFromLane = 1;

    player.moveToLane = 1;

    player.laneProgress = 0;

    player.isMoving = false;

    player.tilt = 0;

    player.shields = 0;

    player.y =
        canvas.height - 110;


    document
        .getElementById("startScreen")
        .classList.add("hidden");


    document
        .getElementById("gameOverScreen")
        .classList.add("hidden");


    isPlaying = true;


    requestAnimationFrame(loop);

}


/* ========================================
   SPAWN ENTITIES
   ======================================== */

function spawnEntity() {

    spawnTimer++;


    /* ------------------------------
       ENEMY
       ------------------------------ */

    const obstacleInterval =
        Math.max(
            22,
            45 -
            Math.floor(score / 150)
        );


    if (
        spawnTimer %
        obstacleInterval === 0
    ) {

        const lane =
            Math.floor(
                Math.random() * 3
            );


        obstacles.push({

            lane: lane,

            y: -90,

            width: 44,

            height: 84

        });

    }


    /* ------------------------------
       POWER-UP
       ------------------------------ */

    if (
        spawnTimer % 160 === 0
    ) {

        const blockedLanes =
            obstacles
                .filter(
                    obstacle =>
                        obstacle.y < 50
                )
                .map(
                    obstacle =>
                        obstacle.lane
                );


        const safeLanes =
            [0, 1, 2].filter(
                lane =>
                    !blockedLanes.includes(lane)
            );


        if (
            safeLanes.length > 0
        ) {

            const lane =
                safeLanes[
                    Math.floor(
                        Math.random() *
                        safeLanes.length
                    )
                ];


            const type =
                Math.random() < 0.5
                    ? "shield"
                    : "turbo";


            powerups.push({

                lane: lane,

                y: -50,

                size: 34,

                type: type

            });

        }

    }

}


/* ========================================
   UPDATE
   ======================================== */

function update() {

    /* Player movement */

    updatePlayerMovement();


    /* Speed */

    gameSpeed =
        4.5 +
        score / 200;


    const currentSpeed =
        turboActive
            ? gameSpeed * 1.8
            : gameSpeed;


    /* Road */

    roadOffset +=
        currentSpeed;


    if (
        roadOffset > 40
    ) {

        roadOffset = 0;

    }


    /* Score */

    score +=
        turboActive
            ? 0.8
            : 0.3;


    /* Turbo timer */

    if (
        powerupTimer > 0
    ) {

        powerupTimer--;


        if (
            powerupTimer <= 0
        ) {

            turboActive = false;

            activePowerupName =
                "NORMAL";

        }

    }


    /* Spawn */

    spawnEntity();


    const lanes =
        getLanes();


    /* ==================================
       ENEMIES
       ================================== */

    for (
        let i = obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];


        obstacle.y +=
            currentSpeed;


        const collision =
            obstacle.lane === player.lane &&
            obstacle.y <
                player.y +
                player.height &&
            obstacle.y +
                obstacle.height >
                player.y;


        if (
            collision
        ) {

            if (
                player.shields > 0
            ) {

                player.shields--;


                playSound(
                    "shield_break"
                );


                screenShakeTimer = 15;


                createParticles(
                    lanes[player.lane],
                    player.y,
                    "#00ffcc",
                    18
                );


                obstacles.splice(
                    i,
                    1
                );

            }
            else {

                gameOver();

                return;

            }

        }
        else if (
            obstacle.y >
            canvas.height
        ) {

            obstacles.splice(
                i,
                1
            );

        }

    }


    /* ==================================
       POWER-UPS
       ================================== */

    for (
        let i = powerups.length - 1;
        i >= 0;
        i--
    ) {

        const powerup =
            powerups[i];


        powerup.y +=
            currentSpeed;


        const collision =
            powerup.lane === player.lane &&
            powerup.y <
                player.y +
                player.height &&
            powerup.y +
                powerup.size >
                player.y;


        if (
            collision
        ) {

            playSound(
                "powerup"
            );


            createParticles(
                lanes[player.lane],
                powerup.y,
                "#ffb86c",
                15
            );


            if (
                powerup.type ===
                "shield"
            ) {

                player.shields++;

                activePowerupName =
                    "SHIELD +1";

            }


            if (
                powerup.type ===
                "turbo"
            ) {

                turboActive = true;

                activePowerupName =
                    "TURBO BOOST!";

                powerupTimer =
                    180;

            }


            powerups.splice(
                i,
                1
            );

        }
        else if (
            powerup.y >
            canvas.height
        ) {

            powerups.splice(
                i,
                1
            );

        }

    }


    /* Particles */

    updateParticles();

}


/* ========================================
   DRAW CAR
   ======================================== */

function drawCar(
    x,
    y,
    w,
    h,
    color,
    isPlayer,
    tilt = 0
) {

    ctx.save();


    /* Smooth car rotation */

    ctx.translate(
        x,
        y + h / 2
    );


    ctx.rotate(
        tilt
    );


    ctx.translate(
        -x,
        -(y + h / 2)
    );


    const cx =
        x - w / 2;


    /* Shadow */

    ctx.fillStyle =
        "rgba(0,0,0,0.5)";

    ctx.fillRect(
        cx - 4,
        y + 8,
        w + 8,
        h - 14
    );


    /* Tires */

    ctx.fillStyle =
        "#010103";


    ctx.fillRect(
        cx - 7,
        y + 16,
        6,
        22
    );


    ctx.fillRect(
        cx + w + 1,
        y + 16,
        6,
        22
    );


    ctx.fillRect(
        cx - 7,
        y + h - 32,
        6,
        22
    );


    ctx.fillRect(
        cx + w + 1,
        y + h - 32,
        6,
        22
    );


    /* Wheels */

    ctx.fillStyle =
        "#64748b";


    ctx.fillRect(
        cx - 6,
        y + 23,
        4,
        8
    );


    ctx.fillRect(
        cx + w + 2,
        y + 23,
        4,
        8
    );


    ctx.fillRect(
        cx - 6,
        y + h - 25,
        4,
        8
    );


    ctx.fillRect(
        cx + w + 2,
        y + h - 25,
        4,
        8
    );


    /* Main body */

    ctx.fillStyle =
        color;


    ctx.beginPath();


    ctx.moveTo(
        cx + 8,
        y + 2
    );


    ctx.lineTo(
        cx + w - 8,
        y + 2
    );


    ctx.quadraticCurveTo(
        cx + w - 2,
        y + 10,
        cx + w,
        y + 26
    );


    ctx.lineTo(
        cx + w - 3,
        y + h - 6
    );


    ctx.quadraticCurveTo(
        cx + w / 2,
        y + h + 2,
        cx + 3,
        y + h - 6
    );


    ctx.lineTo(
        cx,
        y + 26
    );


    ctx.quadraticCurveTo(
        cx + 2,
        y + 10,
        cx + 8,
        y + 2
    );


    ctx.closePath();

    ctx.fill();


    /* Outline */

    ctx.strokeStyle =
        isPlayer
            ? "#ffffff"
            : "#ff1a75";


    ctx.lineWidth = 1.5;

    ctx.stroke();


    /* Windshield */

    ctx.fillStyle =
        "#050508";


    ctx.beginPath();


    ctx.moveTo(
        cx + 6,
        y + 22
    );


    ctx.lineTo(
        cx + w - 6,
        y + 22
    );


    ctx.lineTo(
        cx + w - 4,
        y + 42
    );


    ctx.lineTo(
        cx + 4,
        y + 42
    );


    ctx.closePath();

    ctx.fill();


    /* Cabin */

    ctx.fillStyle =
        color;


    ctx.fillRect(
        cx + 5,
        y + 44,
        w - 10,
        20
    );


    ctx.strokeStyle =
        isPlayer
            ? "#ffffff"
            : "#ff1a75";


    ctx.strokeRect(
        cx + 5,
        y + 44,
        w - 10,
        20
    );


    /* Rear window */

    ctx.fillStyle =
        "#050508";


    ctx.fillRect(
        cx + 6,
        y + 66,
        w - 12,
        8
    );


    /* Lights */

    if (
        isPlayer
    ) {

        ctx.fillStyle =
            "#ffff00";


        ctx.fillRect(
            cx + 2,
            y,
            7,
            5
        );


        ctx.fillRect(
            cx + w - 9,
            y,
            7,
            5
        );


        /* TAXI SIGN */

        ctx.fillStyle =
            "#ff007f";


        ctx.fillRect(
            cx + 10,
            y + 49,
            w - 20,
            8
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "bold 9px VT323";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "TAXI",
            x,
            y + 53
        );

    }
    else {

        ctx.fillStyle =
            "#ff1a1a";


        ctx.fillRect(
            cx + 2,
            y + h - 5,
            8,
            5
        );


        ctx.fillRect(
            cx + w - 10,
            y + h - 5,
            8,
            5
        );

    }


    ctx.restore();

}


/* ========================================
   DRAW
   ======================================== */

function draw() {

    ctx.save();


    /* Screen shake */

    if (
        screenShakeTimer > 0
    ) {

        ctx.translate(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );

        screenShakeTimer--;

    }


    /* Background */

    ctx.fillStyle =
        "#0d1117";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Sidewalks */

    ctx.fillStyle =
        "#161b22";


    ctx.fillRect(
        0,
        0,
        18,
        canvas.height
    );


    ctx.fillRect(
        canvas.width - 18,
        0,
        18,
        canvas.height
    );


    /* Road lines */

    const lanes =
        getLanes();


    ctx.strokeStyle =
        "#00ffcc";


    ctx.lineWidth = 3;


    ctx.setLineDash([
        20,
        20
    ]);


    ctx.lineDashOffset =
        -roadOffset;


    ctx.beginPath();


    ctx.moveTo(
        (lanes[0] + lanes[1]) / 2,
        0
    );


    ctx.lineTo(
        (lanes[0] + lanes[1]) / 2,
        canvas.height
    );


    ctx.moveTo(
        (lanes[1] + lanes[2]) / 2,
        0
    );


    ctx.lineTo(
        (lanes[1] + lanes[2]) / 2,
        canvas.height
    );


    ctx.stroke();


    ctx.setLineDash([]);


    /* Particles */

    for (
        const particle of particles
    ) {

        ctx.save();


        ctx.globalAlpha =
            particle.alpha;


        ctx.fillStyle =
            particle.color;


        ctx.beginPath();


        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.restore();

    }


    /* Player */

    drawCar(
        lanes[player.visualLane],
        player.y,
        player.width,
        player.height,
        "#00ffcc",
        true,
        player.tilt
    );


    /* Shield */

    if (
        player.shields > 0
    ) {

        ctx.strokeStyle =
            "#00ffcc";


        ctx.lineWidth = 3;


        ctx.beginPath();


        ctx.arc(
            lanes[player.visualLane],
            player.y +
                player.height / 2,
            48,
            0,
            Math.PI * 2
        );


        ctx.stroke();

    }


    /* Enemies */

    for (
        const obstacle of obstacles
    ) {

        drawCar(
            lanes[obstacle.lane],
            obstacle.y,
            obstacle.width,
            obstacle.height,
            "#ff0066",
            false
        );

    }


    /* Power-ups */

    for (
        const powerup of powerups
    ) {

        const px =
            lanes[powerup.lane];


        const py =
            powerup.y +
            powerup.size / 2;


        ctx.save();


        ctx.fillStyle =
            powerup.type === "shield"
                ? "#00ffcc"
                : "#ffb86c";


        ctx.beginPath();


        ctx.arc(
            px,
            py,
            powerup.size / 2,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#030305";


        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle =
            "#030305";


        ctx.font =
            "bold 18px VT323";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            powerup.type === "shield"
                ? "S"
                : "T",
            px,
            py
        );


        ctx.restore();

    }


    /* CRT scanlines */

    ctx.fillStyle =
        "rgba(0,0,0,0.15)";


    for (
        let y = 0;
        y < canvas.height;
        y += 4
    ) {

        ctx.fillRect(
            0,
            y,
            canvas.width,
            1
        );

    }


    ctx.restore();

}


/* ========================================
   HUD
   ======================================== */

function updateHUD() {

    document
        .getElementById("scoreDisplay")
        .innerText =
        `SCORE: ${
            Math.floor(score)
                .toString()
                .padStart(4, "0")
        }`;


    document
        .getElementById("speedDisplay")
        .innerText =
        `${gameSpeed.toFixed(1)}X`;


    document
        .getElementById("shieldStatus")
        .innerText =
        `SHIELD: ${player.shields} 🛡️`;


    document
        .getElementById("activePowerup")
        .innerText =
        activePowerupName;

}


/* ========================================
   GAME OVER
   ======================================== */

function gameOver() {

    isPlaying = false;


    stopEngineSound();

    stopBGM();


    playSound(
        "gameover"
    );


    screenShakeTimer = 30;


    const lanes =
        getLanes();


    createParticles(
        lanes[player.visualLane],
        player.y,
        "#ff007f",
        25
    );


    document
        .getElementById("finalScoreText")
        .innerText =
        `FINAL SCORE: ${Math.floor(score)}`;


    document
        .getElementById("gameOverScreen")
        .classList.remove("hidden");

}


/* ========================================
   GAME LOOP
   ======================================== */

function loop() {

    if (!isPlaying) {
        return;
    }


    update();

    draw();

    updateHUD();


    requestAnimationFrame(
        loop
    );

}


/* ========================================
   INITIAL SETUP
   ======================================== */

resizeCanvas();


/* ========================================
   MAKE FUNCTIONS AVAILABLE TO HTML
   ======================================== */

window.startGame =
    startGame;

window.movePlayer =
    movePlayer;

window.resizeCanvas =
    resizeCanvas;
