/* =========================================================
CYBER TAXI
MAIN GAME ENGINE
main.js adalah penghubung seluruh sistem game.

Tugasnya:

initialize game
resize canvas
menjalankan game loop
update semua sistem
render semua visual
mengatur start / restart
menjaga game tetap berjalan di HP & laptop
Arsitektur:

   INPUT
     ↓
   STATE
     ↓
   UPDATE
     ↓
   RENDER
     ↓
   FRAME
     ↺

========================================================= */

/* =========================================================
DOM
========================================================= */

const gameCanvas =
document.getElementById(
"gameCanvas"
);

const gameContext =
gameCanvas
? gameCanvas.getContext("2d")
: null;

/* =========================================================
MAIN LOOP STATE
========================================================= */

const engineState = {

running:
    false,

initialized:
    false,

lastTime:
    0,

accumulator:
    0,

fps:
    60,

frameTime:
    1000 / 60

};

/* =========================================================
INITIALIZE
========================================================= */

function initializeGame() {

if (
    engineState.initialized
) {

    return;

}

if (
    !gameCanvas ||
    !gameContext
) {

    console.error(
        "Cyber Taxi: gameCanvas tidak ditemukan."
    );

    return;

}

/*
 * Resize pertama.
 */

resizeGame();

/*
 * Initialize systems.
 */

initializeGameSystems();

/*
 * Input.
 */

if (
    typeof initializeInput ===
    "function"
) {

    initializeInput();

}

/*
 * Renderer.
 */

if (
    typeof resizeRenderer ===
    "function"
) {

    resizeRenderer(
        gameCanvas
    );

}

/*
 * Window resize.
 */

window.addEventListener(
    "resize",
    handleWindowResize
);

/*
 * Orientation change.
 */

window.addEventListener(
    "orientationchange",
    handleWindowResize
);

engineState.initialized =
    true;

/*
 * Initial frame.
 */

renderFrame();

}

/* =========================================================
SYSTEM INITIALIZATION
========================================================= */

function initializeGameSystems() {

/*
 * State.

 * Kalau state.js punya initializer,
 * jalankan.
 */

if (
    typeof initializeState ===
    "function"
) {

    initializeState();

}

/*
 * Player.
 */

if (
    typeof initializePlayer ===
    "function"
) {

    initializePlayer();

}

/*
 * Traffic.

 * Traffic biasanya tidak perlu
 * spawn ketika menu masih terbuka.
 */

if (
    typeof initializeTraffic ===
    "function"
) {

    initializeTraffic();

}

/*
 * Powerups.
 */

if (
    typeof initializePowerups ===
    "function"
) {

    initializePowerups();

}

/*
 * Effects.

 */

if (
    typeof initializeEffects ===
    "function"
) {

    initializeEffects();

}

}

/* =========================================================
START GAME
========================================================= */

function startGame() {

/*
 * Reset seluruh game.
 */

resetGame();

/*
 * Audio.

 * Browser mobile biasanya mengizinkan audio
 * hanya setelah user melakukan gesture.

 */

if (
    typeof initAudio ===
    "function"
) {

    initAudio();

}

/*
 * Hide menu.
 */

const startScreen =
    document.getElementById(
        "startScreen"
    );

const gameOverScreen =
    document.getElementById(
        "gameOverScreen"
    );

if (
    startScreen
) {

    startScreen.classList.add(
        "hidden"
    );

}

if (
    gameOverScreen
) {

    gameOverScreen.classList.add(
        "hidden"
    );

}

/*
 * Game aktif.
 */

if (
    typeof gameState !==
    "undefined"
) {

    gameState.running =
        true;

    gameState.gameOver =
        false;

}

engineState.running =
    true;

engineState.lastTime =
    performance.now();

/*
 * Pastikan hanya ada satu loop.
 */

if (
    !engineState.loopStarted
) {

    engineState.loopStarted =
        true;

    requestAnimationFrame(
        gameLoop
    );

}

}

/* =========================================================
RESET GAME
========================================================= */

function resetGame() {

/*
 * Reset global state jika tersedia.
 */

if (
    typeof resetGameState ===
    "function"
) {

    resetGameState();

}

/*
 * Reset player.
 */

if (
    typeof resetPlayer ===
    "function"
) {

    resetPlayer();

}

/*
 * Reset traffic.

 */

if (
    typeof resetTraffic ===
    "function"
) {

    resetTraffic();

}

/*
 * Reset powerups.

 */

if (
    typeof resetPowerups ===
    "function"
) {

    resetPowerups();

}

/*
 * Reset effects.

 */

if (
    typeof resetEffects ===
    "function"
) {

    resetEffects();

}

/*
 * Reset renderer.

 */

if (
    typeof renderState !==
    "undefined"
) {

    renderState.time =
        0;

    renderState.roadOffset =
        0;

    renderState.skylineOffset =
        0;

}

/*
 * Reset engine.
 */

engineState.accumulator =
    0;

engineState.lastTime =
    performance.now();

}

/* =========================================================
GAME OVER
========================================================= */

function endGame() {

if (
    !engineState.running
) {

    return;

}

engineState.running =
    false;

if (
    typeof gameState !==
    "undefined"
) {

    gameState.running =
        false;

    gameState.gameOver =
        true;

}

/*
 * Audio.

 */

if (
    typeof playSound ===
    "function"
) {

    playSound(
        "gameover"
    );

}

/*
 * Visual effects.

 */

if (
    typeof triggerGameOverEffect ===
    "function"
) {

    triggerGameOverEffect();

}

/*
 * Game over UI.

 */

showGameOverScreen();

}

/* =========================================================
GAME OVER SCREEN
========================================================= */

function showGameOverScreen() {

const screen =
    document.getElementById(
        "gameOverScreen"
    );

if (!screen) {

    return;

}

/*
 * Score.

 */

const finalScore =
    document.getElementById(
        "finalScoreText"
    );

if (
    finalScore &&
    typeof gameState !==
    "undefined"
) {

    const score =
        Math.floor(
            gameState.score ||
            0
        );

    finalScore.textContent =
        `FINAL SCORE: ${score}`;

}

screen.classList.remove(
    "hidden"
);

}

/* =========================================================
RESIZE
========================================================= */

function resizeGame() {

if (!gameCanvas) {

    return;

}

const container =
    document.getElementById(
        "game-container"
    );

if (!container) {

    return;

}

/*
 * Mobile control height.

 */

const controls =
    document.querySelector(
        ".mobile-controls"
    );

const controlsHeight =
    controls
        ? controls.offsetHeight
        : 0;

/*
 * CSS pixels.

 */

const width =
    container.clientWidth;

const height =
    Math.max(

        200,

        container.clientHeight -
        controlsHeight

    );

/*
 * Device pixel ratio.

 * Membuat canvas lebih tajam di
 * layar Retina / high DPI.

 */

const dpr =
    Math.min(
        window.devicePixelRatio ||
        1,
        2
    );

gameCanvas.style.width =
    `${width}px`;

gameCanvas.style.height =
    `${height}px`;

gameCanvas.width =
    Math.floor(
        width * dpr
    );

gameCanvas.height =
    Math.floor(
        height * dpr
    );

/*
 * Semua koordinat renderer
 * menggunakan CSS pixel.

 */

gameContext.setTransform(

    dpr,
    0,
    0,
    dpr,
    0,
    0

);

/*
 * Update game dimensions.

 */

if (
    typeof gameState !==
    "undefined"
) {

    gameState.canvasWidth =
        width;

    gameState.canvasHeight =
        height;

}

/*
 * Player ikut menyesuaikan posisi.

 */

if (
    typeof updatePlayerPosition ===
    "function"
) {

    updatePlayerPosition();

}

/*
 * Renderer.

 */

if (
    typeof resizeRenderer ===
    "function"
) {

    resizeRenderer(
        gameCanvas
    );

}

}

/* =========================================================
RESIZE HANDLER
========================================================= */

let resizeTimeout =
null;

function handleWindowResize() {

clearTimeout(
    resizeTimeout
);

resizeTimeout =
    setTimeout(
        () => {

            resizeGame();

            renderFrame();

        },
        100
    );

}

/* =========================================================
GAME LOOP
========================================================= */

function gameLoop(
timestamp
) {

/*
 * Loop selalu meminta frame berikutnya.

 * Dengan begini ketika game over,
 * renderer masih bisa menampilkan
 * layar terakhir tanpa membuat loop
 * baru-baru lagi.

 */

requestAnimationFrame(
    gameLoop
);

/*
 * Delta time.

 */

let delta =
    timestamp -
    engineState.lastTime;

engineState.lastTime =
    timestamp;

/*
 * Hindari giant jump ketika tab
 * ditinggal / HP sleep.

 */

delta =
    Math.min(
        delta,
        100
    );

/*
 * FPS estimate.

 */

if (
    delta > 0
) {

    const instantFPS =
        1000 /
        delta;

    engineState.fps =
        engineState.fps *
        0.9 +
        instantFPS *
        0.1;

}

/*
 * Kalau game tidak aktif,
 * tetap render frame.
 */

if (
    !engineState.running
) {

    renderFrame();

    return;

}

/*
 * Update.

 */

updateGame(
    delta
);

/*
 * Render.

 */

renderFrame();

}

/* =========================================================
UPDATE GAME
========================================================= */

function updateGame(
delta
) {

/*
 * Normalisasi ke 60 FPS.

 */

const dt =
    Math.min(
        delta /
        (1000 / 60),

        2

    );

/*
 * Global time.

 */

if (
    typeof gameState !==
    "undefined"
) {

    gameState.time =
        (
            gameState.time ||
            0
        ) +
        dt;

}

/*
 * PLAYER
 */

if (
    typeof updatePlayer ===
    "function"
) {

    updatePlayer(
        dt
    );

}

/*
 * TRAFFIC
 */

if (
    typeof updateTraffic ===
    "function"
) {

    updateTraffic(
        dt
    );

}

/*
 * POWERUPS
 */

if (
    typeof updatePowerups ===
    "function"
) {

    updatePowerups(
        dt
    );

}

/*
 * EFFECTS
 */

if (
    typeof updateEffects ===
    "function"
) {

    updateEffects(
        dt
    );

}

/*
 * Renderer movement.

 * Road bergerak mengikuti speed game.

 */

updateRendererMotion(
    dt
);

/*
 * Collision.

 */

if (
    typeof checkCollisions ===
    "function"
) {

    const collisionResult =
        checkCollisions();

    if (
        collisionResult ===
        "gameover"
    ) {

        endGame();

    }

}

/*
 * Update HUD.

 */

updateHUD();

}

/* =========================================================
RENDERER MOTION
========================================================= */

function updateRendererMotion(
dt
) {

let speed =
    4;

if (
    typeof gameState !==
    "undefined"
) {

    speed =
        gameState.speed ||
        4;

}

/*
 * Turbo.

 */

if (
    typeof gameState !==
    "undefined" &&
    gameState.turboActive
) {

    speed *=
        1.8;

}

renderState.roadOffset +=
    speed *
    dt;

renderState.skylineOffset +=
    speed *
    0.03 *
    dt;

}

/* =========================================================
RENDER
========================================================= */

function renderFrame() {

if (
    !gameContext ||
    !gameCanvas
) {

    return;

}

/*
 * Renderer utama.

 */

if (
    typeof renderGame ===
    "function"
) {

    /*
     * Karena canvas memakai DPR,
     * renderer harus bekerja dalam
     * CSS pixel coordinates.
     */

    const width =
        gameCanvas.clientWidth;

    const height =
        gameCanvas.clientHeight;

    gameContext.save();

    gameContext.beginPath();

    gameContext.rect(

        0,
        0,

        width,
        height

    );

    gameContext.clip();

    renderGame(
        gameContext,
        {
            width:
                width,

            height:
                height
        }
    );

    gameContext.restore();

}

/*
 * HUD DOM.

 */

updateHUD();

}

/* =========================================================
HUD
========================================================= */

function updateHUD() {

if (
    typeof gameState ===
    "undefined"
) {

    return;

}

/*
 * SCORE
 */

const scoreDisplay =
    document.getElementById(
        "scoreDisplay"
    );

if (
    scoreDisplay
) {

    const score =
        Math.floor(
            gameState.score ||
            0
        );

    scoreDisplay.textContent =
        `SCORE: ${score
            .toString()
            .padStart(
                4,
                "0"
            )}`;

}

/*
 * SPEED
 */

const speedDisplay =
    document.getElementById(
        "speedDisplay"
    );

if (
    speedDisplay
) {

    const speed =
        gameState.speed ||
        0;

    speedDisplay.textContent =
        `${speed.toFixed(1)}X`;

}

/*
 * SHIELD
 */

const shieldStatus =
    document.getElementById(
        "shieldStatus"
    );

if (
    shieldStatus
) {

    const shields =
        gameState.player
            ? gameState.player.shields || 0
            : 0;

    shieldStatus.textContent =
        `SHIELD: ${shields} 🛡️`;

}

/*
 * POWERUP

 */

const activePowerup =
    document.getElementById(
        "activePowerup"
    );

if (
    activePowerup
) {

    let label =
        gameState.activePowerup ||
        "READY";

    /*
     * Turbo timer.

     */

    if (
        gameState.turboActive &&
        gameState.powerupTimer >
        0
    ) {

        const seconds =
            Math.ceil(
                gameState.powerupTimer /
                60
            );

        label =
            `TURBO ${seconds}s`;

    }

    activePowerup.textContent =
        label;

}

}

/* =========================================================
VISIBILITY
========================================================= */

document.addEventListener(
"visibilitychange",
() => {

    if (
        document.hidden
    ) {

        /*
         * Jangan menghukum pemain
         * ketika pindah app/tab.

         */

        engineState.lastTime =
            performance.now();

    }

}

);

/* =========================================================
DEBUG MODE
========================================================= */

function getEngineDebugInfo() {

return {

    running:
        engineState.running,

    initialized:
        engineState.initialized,

    fps:
        Number(
            engineState.fps.toFixed(
                1
            )
        ),

    canvasWidth:
        gameCanvas
            ? gameCanvas.clientWidth
            : 0,

    canvasHeight:
        gameCanvas
            ? gameCanvas.clientHeight
            : 0

};

}

/* =========================================================
AUTO INIT
========================================================= */

if (
document.readyState ===
"loading"
) {

document.addEventListener(

    "DOMContentLoaded",

    initializeGame

);

} else {

initializeGame();

}
