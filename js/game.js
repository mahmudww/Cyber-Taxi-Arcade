/* ========================================
   CYBER TAXI — GAME
   Clean 3-Lane Version
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
   DOM
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

let animationFrame = null;


/* ========================================
   CANVAS
   ======================================== */

function resizeCanvas() {

    if (!container || !controls) {
        return;
    }

    canvas.width =
        container.clientWidth;

    canvas.height =
        container.clientHeight -
        controls.offsetHeight;


    /*
     * Keep player at the correct
     * position after resize.
     */

    if (isPlaying) {

        player.y =
            canvas.height - 110;

    }

}


/* ========================================
   LANES
   ======================================== */

function getLanes() {

    const center =
        canvas.width / 2;

    const laneSpacing =
        75;

    return [
        center - laneSpacing,
        center,
        center + laneSpacing
    ];

}


/* ========================================
   PLAYER CONTROL
   ======================================== */

function movePlayer(direction) {

    if (!isPlaying) {
        return;
    }


    /*
     * entities.js handles the actual
     * lane change and smooth animation.
     */

    const moved =
        entityMovePlayer(direction);


    if (!moved) {
        return;
    }


    playSound("move");


    /*
     * Create a little neon trail
     * during lane changes.
     */

    const lanes =
        getLanes();


    createParticles(
        lanes[player.lane],
        player.y + player.height / 2,
        "#00ffcc",
        6
    );

}


/* ========================================
   KEYBOARD
   ======================================== */

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();


        if (key === "arrowleft" || key === "a") {

            event.preventDefault();

            movePlayer(-1);

        }


        if (key === "arrowright" || key === "d") {

            event.preventDefault();

            movePlayer(1);

        }

    }
);


/* ========================================
   START GAME
   ======================================== */

function startGame() {

    /*
     * Start audio after user interaction.
     */

    initAudio();


    resizeCanvas();


    /*
     * Reset all entities.
     */

    resetEntities();


    /* Reset game state */

    score = 0;

    gameSpeed = 4.5;

    roadOffset = 0;

    spawnTimer = 0;

    screenShakeTimer = 0;

    turboActive = false;

    powerupTimer = 0;

    activePowerupName = "READY";


    /*
     * Player starts in CENTER lane.
     *
     * lane:
     * 0 = left
     * 1 = center
     * 2 = right
     */

    player.lane = 1;

    player.visualLane = 1;

    player.moveFromLane = 1;

    player.moveToLane = 1;

    player.laneProgress = 0;

    player.isMoving = false;

    player.tilt = 0;

    player.shields = 0;


    /*
     * Player vertical position.
     */

    player.y =
        canvas.height - 110;


    /*
     * Hide screens.
     */

    const startScreen =
        document.getElementById("startScreen");

    const gameOverScreen =
        document.getElementById("gameOverScreen");


    if (startScreen) {
        startScreen.classList.add("hidden");
    }


    if (gameOverScreen) {
        gameOverScreen.classList.add("hidden");
    }


    /*
     * Start game.
     */

    isPlaying = true;


    /*
     * Prevent multiple game loops.
     */

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }


    animationFrame =
        requestAnimationFrame(loop);

}


/* ========================================
   SPAWN ENTITY
   ======================================== */

function spawnEntity() {

    spawnTimer++;


    /* ==================================
       ENEMY SPAWN
       ================================== */

    const obstacleInterval =
        Math.max(
            22,
            45 -
            Math.floor(score / 150)
        );


    if (
        spawnTimer % obstacleInterval === 0
    ) {

        /*
         * Pick random lane.
         */

        const lane =
            Math.floor(
                Math.random() * 3
            );


        /*
         * Don't spawn directly on top
         * of another enemy near the top.
         */

        const blocked =
            obstacles.some(
                obstacle =>
                    obstacle.lane === lane &&
                    obstacle.y < 120
            );


        if (!blocked) {

            obstacles.push({

                lane: lane,

                y: -90,

                width: 44,

                height: 84

            });

        }

    }


    /* ==================================
       POWER-UP SPAWN
       ================================== */

    if (
        spawnTimer % 160 === 0
    ) {

        /*
         * Find lanes that don't currently
         * have an enemy near the top.
         */

        const blockedLanes =
            obstacles
                .filter(
                    obstacle =>
                        obstacle.y < 160
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

    /*
     * Update smooth player animation.
     *
     * entities.js handles:
     * visualLane
     * laneProgress
     * tilt
     */

    updatePlayerMovement();


    /* ==================================
       SPEED
       ================================== */

    gameSpeed =
        4.5 +
        score / 200;


    const currentSpeed =
        turboActive
            ? gameSpeed * 1.8
            : gameSpeed;


    /* ==================================
       ROAD
       ================================== */

    roadOffset +=
        currentSpeed;


    if (roadOffset > 40) {
        roadOffset = 0;
    }


    /* ==================================
       SCORE
       ================================== */

    score +=
        turboActive
            ? 0.8
            : 0.3;


    /* ==================================
       TURBO TIMER
       ================================== */

    if (powerupTimer > 0) {

        powerupTimer--;


        if (powerupTimer <= 0) {

            turboActive = false;

            activePowerupName =
                "NORMAL";

        }

    }


    /* ==================================
       SPAWN
       ================================== */

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


        /*
         * Move enemy downward.
         */

        obstacle.y +=
            currentSpeed;


        /*
         * Collision uses the logical lane,
         * not visualLane.
         *
         * This means collision remains stable
         * during animation.
         */

        const collision =
            obstacle.lane === player.lane &&
            obstacle.y <
                player.y +
                player.height &&
            obstacle.y +
                obstacle.height >
                player.y;


        if (collision) {

            /* ==========================
               SHIELD HIT
               ========================== */

            if (player.shields > 0) {

                player.shields--;


                playSound(
                    "shield_break"
                );


                screenShakeTimer = 15;


                createParticles(
                    lanes[player.lane],
                    player.y +
                        player.height / 2,
                    "#00ffcc",
                    18
                );


                obstacles.splice(
                    i,
                    1
                );

            }


            /* ==========================
               GAME OVER
               ========================== */

            else {

                gameOver();

                return;

            }

        }


        /* ==============================
           REMOVE OFFSCREEN ENEMY
           ============================== */

        else if (
            obstacle.y >
            canvas.height + 100
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


        /*
         * Move downward.
         */

        powerup.y +=
            currentSpeed;


        /*
         * Collision.
         */

        const collision =
            powerup.lane === player.lane &&
            powerup.y <
                player.y +
                player.height &&
            powerup.y +
                powerup.size >
                player.y;


        if (collision) {

            playSound(
                "powerup"
            );


            createParticles(
                lanes[player.lane],
                powerup.y +
                    powerup.size / 2,
                "#ffb86c",
                15
            );


            /* ==========================
               SHIELD
               ========================== */

            if (
                powerup.type === "shield"
            ) {

                player.shields++;


                activePowerupName =
                    "SHIELD +1";

            }


            /* ==========================
               TURBO
               ========================== */

            else if (
                powerup.type === "turbo"
            ) {

                turboActive = true;


                activePowerupName =
                    "TURBO BOOST!";


                /*
                 * 180 frames ≈ 3 seconds
                 * at 60 FPS.
                 */

                powerupTimer = 180;

            }


            powerups.splice(
                i,
                1
            );

        }


        /* ==============================
           REMOVE OFFSCREEN POWERUP
           ============================== */

        else if (
            powerup.y >
            canvas.height + 100
        ) {

            powerups.splice(
                i,
                1
            );

        }

    }


    /* ==================================
       PARTICLES
       ================================== */

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


    /* ==================================
       ROTATION
       ================================== */

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


    /* ==================================
       GLOW
       ================================== */

    ctx.shadowBlur =
        isPlayer ? 14 : 10;


    ctx.shadowColor =
        isPlayer
            ? "#00ffcc"
            : "#ff0066";


    /* ==================================
       SHADOW
       ================================== */

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "rgba(0,0,0,0.55)";


    ctx.fillRect(
        cx - 4,
        y + 8,
        w + 8,
        h - 14
    );


    /* ==================================
       TIRES
       ================================== */

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


    /* ==================================
       WHEEL HUBS
       ================================== */

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


    /* ==================================
       MAIN BODY
       ================================== */

    ctx.shadowBlur =
        isPlayer ? 10 : 8;

    ctx.shadowColor =
        isPlayer
            ? "#00ffcc"
            : "#ff0066";


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


    /* ==================================
       OUTLINE
       ================================== */

    ctx.shadowBlur = 0;


    ctx.strokeStyle =
        isPlayer
            ? "#ffffff"
            : "#ff1a75";


    ctx.lineWidth = 1.5;

    ctx.stroke();


    /* ==================================
       FRONT HOOD
       ================================== */

    ctx.fillStyle =
        isPlayer
            ? "#00b38f"
            : "#cc0052";


    ctx.fillRect(
        cx + 8,
        y + 6,
        w - 16,
        12
    );


    /* ==================================
       WINDSHIELD
       ================================== */

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


    /* ==================================
       CABIN
       ================================== */

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


    /* ==================================
       REAR WINDOW
       ================================== */

    ctx.fillStyle =
        "#050508";


    ctx.fillRect(
        cx + 6,
        y + 66,
        w - 12,
        8
    );


    /* ==================================
       LIGHTS
       ================================== */

    if (isPlayer) {

        /*
         * Front headlights
         */

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


        /*
         * Taxi sign
         */

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
            "bold 9px VT323, monospace";


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

        /*
         * Enemy headlights
         */

        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            cx + 3,
            y,
            6,
            4
        );


        ctx.fillRect(
            cx + w - 9,
            y,
            6,
            4
        );


        /*
         * Enemy tail lights
         */

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
   DRAW ROAD
   ======================================== */

function drawRoad() {

    /* ==================================
       BACKGROUND
       ================================== */

    ctx.fillStyle =
        "#0d1117";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* ==================================
       SIDEWALKS
       ================================== */

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


    /* ==================================
       SIDE NEON GLOW
       ================================== */

    const sideGradient =
        ctx.createLinearGradient(
            0,
            0,
            35,
            0
        );


    sideGradient.addColorStop(
        0,
        "rgba(0,255,204,0)"
    );


    sideGradient.addColorStop(
        1,
        "rgba(0,255,204,0.10)"
    );


    ctx.fillStyle =
        sideGradient;


    ctx.fillRect(
        18,
        0,
        20,
        canvas.height
    );


    const rightGradient =
        ctx.createLinearGradient(
            canvas.width - 35,
            0,
            canvas.width,
            0
        );


    rightGradient.addColorStop(
        0,
        "rgba(255,0,127,0.10)"
    );


    rightGradient.addColorStop(
        1,
        "rgba(255,0,127,0)"
    );


    ctx.fillStyle =
        rightGradient;


    ctx.fillRect(
        canvas.width - 38,
        0,
        20,
        canvas.height
    );


    /* ==================================
       LANE LINES
       ================================== */

    const lanes =
        getLanes();


    ctx.strokeStyle =
        "#00ffcc";


    ctx.lineWidth = 3;


    ctx.shadowBlur = 8;

    ctx.shadowColor =
        "#00ffcc";


    ctx.setLineDash([
        20,
        20
    ]);


    ctx.lineDashOffset =
        -roadOffset;


    ctx.beginPath();


    const leftLine =
        (lanes[0] + lanes[1]) / 2;


    const rightLine =
        (lanes[1] + lanes[2]) / 2;


    ctx.moveTo(
        leftLine,
        0
    );


    ctx.lineTo(
        leftLine,
        canvas.height
    );


    ctx.moveTo(
        rightLine,
        0
    );


    ctx.lineTo(
        rightLine,
        canvas.height
    );


    ctx.stroke();


    ctx.setLineDash([]);


    ctx.shadowBlur = 0;

}


/* ========================================
   DRAW PARTICLES
   ======================================== */

function drawParticles() {

    for (
        const particle of particles
    ) {

        ctx.save();


        ctx.globalAlpha =
            particle.alpha;


        ctx.fillStyle =
            particle.color;


        ctx.shadowBlur = 8;

        ctx.shadowColor =
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

}


/* ========================================
   DRAW POWER-UPS
   ======================================== */

function drawPowerups() {

    const lanes =
        getLanes();


    for (
        const powerup of powerups
    ) {

        const px =
            lanes[powerup.lane];


        const py =
            powerup.y +
            powerup.size / 2;


        const color =
            powerup.type === "shield"
                ? "#00ffcc"
                : "#ffb86c";


        ctx.save();


        /*
         * Glow
         */

        ctx.shadowBlur = 18;

        ctx.shadowColor =
            color;


        /*
         * Outer circle
         */

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.arc(
            px,
            py,
            powerup.size / 2,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /*
         * Dark outline
         */

        ctx.shadowBlur = 0;


        ctx.strokeStyle =
            "#030305";


        ctx.lineWidth = 3;


        ctx.stroke();


        /*
         * Icon
         */

        ctx.fillStyle =
            "#030305";


        ctx.font =
            "bold 18px VT323, monospace";


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

}


/* ========================================
   DRAW PLAYER
   ======================================== */

function drawPlayer() {

    const lanes =
        getLanes();


    /*
     * IMPORTANT:
     *
     * visualLane is fractional while
     * the player is moving.
     *
     * Example:
     *
     * 1 -> 0
     *
     * visualLane:
     * 1.00
     * 0.82
     * 0.64
     * 0.46
     * 0.28
     * 0.00
     *
     * Therefore we interpolate the actual
     * X position between the two lanes.
     */

    const fromLane =
        player.moveFromLane;


    const toLane =
        player.moveToLane;


    const visualX =
        lanes[fromLane] +
        (
            lanes[toLane] -
            lanes[fromLane]
        ) *
        player.laneProgress;


    /*
     * When not moving, make absolutely sure
     * the car sits on its logical lane.
     */

    const finalX =
        player.isMoving
            ? visualX
            : lanes[player.lane];


    drawCar(
        finalX,
        player.y,
        player.width,
        player.height,
        "#00ffcc",
        true,
        player.tilt
    );


    /* ==================================
       SHIELD
       ================================== */

    if (player.shields > 0) {

        ctx.save();


        ctx.strokeStyle =
            "#00ffcc";


        ctx.lineWidth = 3;


        ctx.shadowBlur = 14;

        ctx.shadowColor =
            "#00ffcc";


        ctx.beginPath();


        ctx.arc(
            finalX,
            player.y +
                player.height / 2,
            48,
            0,
            Math.PI * 2
        );


        ctx.stroke();


        ctx.restore();

    }

}


/* ========================================
   DRAW ENEMIES
   ======================================== */

function drawEnemies() {

    const lanes =
        getLanes();


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

}


/* ========================================
   DRAW
   ======================================== */

function draw() {

    ctx.save();


    /* ==================================
       SCREEN SHAKE
       ================================== */

    if (
        screenShakeTimer > 0
    ) {

        ctx.translate(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );


        screenShakeTimer--;

    }


    /* ==================================
       ROAD
       ================================== */

    drawRoad();


    /* ==================================
       PARTICLES
       ================================== */

    drawParticles();


    /* ==================================
       POWERUPS
       ================================== */

    drawPowerups();


    /* ==================================
       ENEMIES
       ================================== */

    drawEnemies();


    /* ==================================
       PLAYER
       ================================== */

    drawPlayer();


    /* ==================================
       CRT SCANLINES
       ================================== */

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

    const scoreDisplay =
        document.getElementById(
            "scoreDisplay"
        );


    const speedDisplay =
        document.getElementById(
            "speedDisplay"
        );


    const shieldStatus =
        document.getElementById(
            "shieldStatus"
        );


    const activePowerup =
        document.getElementById(
            "activePowerup"
        );


    if (scoreDisplay) {

        scoreDisplay.innerText =
            `SCORE: ${
                Math.floor(score)
                    .toString()
                    .padStart(4, "0")
            }`;

    }


    if (speedDisplay) {

        speedDisplay.innerText =
            `${gameSpeed.toFixed(1)}X`;

    }


    if (shieldStatus) {

        shieldStatus.innerText =
            `SHIELD: ${
                player.shields
            } 🛡️`;

    }


    if (activePowerup) {

        activePowerup.innerText =
            activePowerupName;

    }

}


/* ========================================
   GAME OVER
   ======================================== */

function gameOver() {

    /*
     * Stop gameplay.
     */

    isPlaying = false;


    /*
     * Stop engine and BGM.
     */

    stopEngineSound();

    stopBGM();


    /*
     * Play game over sound.
     */

    playSound(
        "gameover"
    );


    screenShakeTimer = 30;


    /*
     * Explosion particles.
     */

    const lanes =
        getLanes();


    createParticles(
        lanes[player.lane],
        player.y +
            player.height / 2,
        "#ff007f",
        25
    );


    /*
     * Final score.
     */

    const finalScore =
        document.getElementById(
            "finalScoreText"
        );


    if (finalScore) {

        finalScore.innerText =
            `FINAL SCORE: ${
                Math.floor(score)
            }`;

    }


    /*
     * Show game over screen.
     */

    const gameOverScreen =
        document.getElementById(
            "gameOverScreen"
        );


    if (gameOverScreen) {

        gameOverScreen.classList.remove(
            "hidden"
        );

    }

}


/* ========================================
   GAME LOOP
   ======================================== */

function loop() {

    if (!isPlaying) {
        animationFrame = null;
        return;
    }


    update();

    draw();

    updateHUD();


    animationFrame =
        requestAnimationFrame(
            loop
        );

}


/* ========================================
   INITIAL SETUP
   ======================================== */

resizeCanvas();


window.addEventListener(
    "resize",
    resizeCanvas
);


/* ========================================
   EXPORTS
   ======================================== */

export {
    startGame,
    movePlayer,
    resizeCanvas
};
