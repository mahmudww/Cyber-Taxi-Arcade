import {
    player,
    obstacles,
    powerups,
    particles,
    createParticles,
    updateParticles,
    resetEntities
} from "./entities.js";

import {
    initAudio,
    stopEngineSound,
    playSound
} from "./audio.js";


/* ========================================
   CANVAS
   ======================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

    activePowerupName = "READY";


    player.lane = 1;

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
   MOVE PLAYER
   ======================================== */

function movePlayer(direction) {

    if (!isPlaying) return;

    const newLane =
        player.lane + direction;

    if (
        newLane >= 0 &&
        newLane <= 2
    ) {

        player.lane = newLane;

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

}


/* ========================================
   SPAWN ENEMY / POWER-UP
   ======================================== */

function spawnEntity() {

    spawnTimer++;


    /* ------------------------------
       ENEMY
       ------------------------------ */

    const obstacleInterval =
        Math.max(
            22,
            45 - Math.floor(score / 150)
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


        if (safeLanes.length > 0) {

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

    gameSpeed =
        4.5 +
        score / 200;


    const currentSpeed =
        turboActive
            ? gameSpeed * 1.8
            : gameSpeed;


    /* ROAD */

    roadOffset +=
        currentSpeed;

    if (roadOffset > 40) {
        roadOffset = 0;
    }


    /* SCORE */

    score +=
        turboActive
            ? 0.8
            : 0.3;


    /* POWER-UP TIMER */

    if (powerupTimer > 0) {

        powerupTimer--;

        if (powerupTimer <= 0) {

            turboActive = false;

            activePowerupName =
                "NORMAL";

        }

    }


    /* SPAWN */

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
                player.y + player.height &&
            obstacle.y +
                obstacle.height >
                player.y;


        if (collision) {

            if (player.shields > 0) {

                player.shields--;

                playSound(
                    "shield_break"
                );

                createParticles(
                    lanes[player.lane],
                    player.y,
                    "#00ffcc",
                    18
                );

                obstacles.splice(i, 1);

            } else {

                gameOver();

                return;

            }

        }
        else if (
            obstacle.y >
            canvas.height
        ) {

            obstacles.splice(i, 1);

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
                player.y + player.height &&
            powerup.y +
                powerup.size >
                player.y;


        if (collision) {

            playSound("powerup");


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

                powerupTimer = 180;

            }


            powerups.splice(i, 1);

        }
        else if (
            powerup.y >
            canvas.height
        ) {

            powerups.splice(i, 1);

        }

    }


    /* PARTICLES */

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
    isPlayer
) {

    const cx =
        x - w / 2;


    ctx.save();


    /* SHADOW */

    ctx.fillStyle =
        "rgba(0,0,0,0.5)";

    ctx.fillRect(
        cx - 4,
        y + 8,
        w + 8,
        h - 14
    );


    /* TIRES */

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


    /* BODY */

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


    /* OUTLINE */

    ctx.strokeStyle =
        isPlayer
            ? "#ffffff"
            : "#ff1a75";

    ctx.lineWidth = 1.5;

    ctx.stroke();


    /* WINDSHIELD */

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


    /* CABIN */

    ctx.fillStyle =
        color;

    ctx.fillRect(
        cx + 5,
        y + 44,
        w - 10,
        20
    );


    /* REAR WINDOW */

    ctx.fillStyle =
        "#050508";

    ctx.fillRect(
        cx + 6,
        y + 66,
        w - 12,
        8
    );


    /* LIGHTS */

    if (isPlayer) {

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


    /* SCREEN SHAKE */

    if (
        screenShakeTimer > 0
    ) {

        ctx.translate(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );

        screenShakeTimer--;

    }


    /* BACKGROUND */

    ctx.fillStyle =
        "#0d1117";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* SIDEWALKS */

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


    /* ROAD LINES */

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


    /* PARTICLES */

    for (
        const particle of particles
    ) {

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

    }

    ctx.globalAlpha = 1;


    /* PLAYER */

    drawCar(
        lanes[player.lane],
        player.y,
        player.width,
        player.height,
        "#00ffcc",
        true
    );


    /* SHIELD */

    if (
        player.shields > 0
    ) {

        ctx.strokeStyle =
            "#00ffcc";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
            lanes[player.lane],
            player.y +
                player.height / 2,
            48,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }


    /* ENEMIES */

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


    /* POWER-UPS */

    for (
        const powerup of powerups
    ) {

        const px =
            lanes[powerup.lane];

        const py =
            powerup.y +
            powerup.size / 2;


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

    }


    /* CRT */

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


    playSound(
        "gameover"
    );


    const lanes =
        getLanes();


    createParticles(
        lanes[player.lane],
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
   INITIAL CANVAS
   ======================================== */

resizeCanvas();


/* ========================================
   EXPORT
   ======================================== */

export {
    startGame,
    movePlayer,
    resizeCanvas
};
