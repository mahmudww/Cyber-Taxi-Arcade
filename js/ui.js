/* =========================================================
CYBER TAXI
UI SYSTEM
ui.js menangani semua interface yang terlihat di layar:

Loading screen
Start menu
HUD
Pause screen
Game over screen
Score
Speed
Shield
Combo
Power-up
Floating text
Screen effects
UI TIDAK mengatur gameplay.

Gameplay tetap menjadi tanggung jawab game.js.
========================================================= */

/* =========================================================
UI REFERENCES
========================================================= */

const UI = {

loadingScreen:
    document.getElementById(
        "loadingScreen"
    ),

loadingProgress:
    document.getElementById(
        "loadingProgress"
    ),

loadingText:
    document.getElementById(
        "loadingText"
    ),

startScreen:
    document.getElementById(
        "startScreen"
    ),

startButton:
    document.getElementById(
        "startButton"
    ),

pauseScreen:
    document.getElementById(
        "pauseScreen"
    ),

resumeButton:
    document.getElementById(
        "resumeButton"
    ),

pauseButton:
    document.getElementById(
        "pauseButton"
    ),

gameOverScreen:
    document.getElementById(
        "gameOverScreen"
    ),

restartButton:
    document.getElementById(
        "restartButton"
    ),

scoreDisplay:
    document.getElementById(
        "scoreDisplay"
    ),

speedDisplay:
    document.getElementById(
        "speedDisplay"
    ),

shieldDisplay:
    document.getElementById(
        "shieldDisplay"
    ),

comboDisplay:
    document.getElementById(
        "comboDisplay"
    ),

comboValue:
    document.getElementById(
        "comboValue"
    ),

powerupDisplay:
    document.getElementById(
        "powerupDisplay"
    ),

powerupText:
    document.getElementById(
        "powerupText"
    ),

finalScoreDisplay:
    document.getElementById(
        "finalScoreDisplay"
    ),

highScoreDisplay:
    document.getElementById(
        "highScoreDisplay"
    ),

newHighScore:
    document.getElementById(
        "newHighScore"
    ),

speedLines:
    document.getElementById(
        "speedLines"
    ),

screenFlash:
    document.getElementById(
        "screenFlash"
    ),

floatingTextLayer:
    document.getElementById(
        "floatingTextLayer"
    )

};

/* =========================================================
UI STATE
========================================================= */

const uiState = {

initialized:
    false,

loadingFinished:
    false,

currentScreen:
    "loading",

floatingTextId:
    0,

flashTimeout:
    null,

lastScore:
    0,

lastSpeed:
    0,

lastShield:
    0,

lastCombo:
    0,

lastPowerup:
    ""

};

/* =========================================================
HELPERS
========================================================= */

function uiShow(element) {

if (!element) {

    return;

}

element.classList.remove(
    "hidden"
);

}

function uiHide(element) {

if (!element) {

    return;

}

element.classList.add(
    "hidden"
);

}

/* =========================================================
INITIALIZE UI
========================================================= */

function initializeUI() {

if (
    uiState.initialized
) {

    return;

}

/*
 * Pastikan keadaan awal bersih.
 */

uiHide(
    UI.pauseScreen
);

uiHide(
    UI.gameOverScreen
);

uiHide(
    UI.comboDisplay
);

uiHide(
    UI.powerupDisplay
);

uiHide(
    UI.speedLines
);

/*
 * Loading screen tetap terlihat
 * sampai initialization selesai.
 */

uiShow(
    UI.loadingScreen
);

/*
 * Tombol start.
 */

if (
    UI.startButton
) {

    UI.startButton.addEventListener(
        "click",
        handleStartButton
    );

}

/*
 * Restart.
 */

if (
    UI.restartButton
) {

    UI.restartButton.addEventListener(
        "click",
        handleRestartButton
    );

}

/*
 * Pause.

 */

if (
    UI.pauseButton
) {

    UI.pauseButton.addEventListener(
        "click",
        handlePauseButton
    );

}

/*
 * Resume.

 */

if (
    UI.resumeButton
) {

    UI.resumeButton.addEventListener(
        "click",
        handleResumeButton
    );

}

uiState.initialized =
    true;

}

/* =========================================================
BUTTON HANDLERS
========================================================= */

function handleStartButton() {

if (
    typeof startGame ===
    "function"
) {

    startGame();

}

}

function handleRestartButton() {

if (
    typeof startGame ===
    "function"
) {

    startGame();

}

}

function handlePauseButton() {

if (
    typeof togglePause ===
    "function"
) {

    togglePause();

}

}

function handleResumeButton() {

if (
    typeof togglePause ===
    "function"
) {

    togglePause();

}

}

/* =========================================================
LOADING SCREEN
========================================================= */

function setLoadingProgress(
progress,
message
) {

/*
 * Clamp 0 → 100.
 */

progress =
    Math.max(
        0,
        Math.min(
            100,
            progress
        )
    );

if (
    UI.loadingProgress
) {

    UI.loadingProgress.style.width =
        `${progress}%`;

}

if (
    message &&
    UI.loadingText
) {

    UI.loadingText.textContent =
        message;

}

}

function finishLoading() {

if (
    uiState.loadingFinished
) {

    return;

}

uiState.loadingFinished =
    true;

setLoadingProgress(
    100,
    "NIGHT SHIFT READY."
);

/*
 * Sedikit delay supaya loading
 * terasa seperti transisi,
 * bukan langsung menghilang.

 */

setTimeout(
    () => {

        uiHide(
            UI.loadingScreen
        );

        uiState.currentScreen =
            "start";

        showStartScreen();

    },
    450
);

}

/* =========================================================
START SCREEN
========================================================= */

function showStartScreen() {

uiState.currentScreen =
    "start";

uiHide(
    UI.pauseScreen
);

uiHide(
    UI.gameOverScreen
);

uiShow(
    UI.startScreen
);

/*
 * Pause button tidak diperlukan
 * di menu.

 */

uiHide(
    UI.pauseButton
);

}

function hideStartScreen() {

uiHide(
    UI.startScreen
);

}

/* =========================================================
PLAYING STATE
========================================================= */

function showGameUI() {

uiState.currentScreen =
    "playing";

uiHide(
    UI.startScreen
);

uiHide(
    UI.pauseScreen
);

uiHide(
    UI.gameOverScreen
);

uiShow(
    UI.pauseButton
);

updateHUD();

}

/* =========================================================
PAUSE
========================================================= */

function showPauseScreen() {

uiState.currentScreen =
    "paused";

uiShow(
    UI.pauseScreen
);

uiHide(
    UI.pauseButton
);

}

function hidePauseScreen() {

uiHide(
    UI.pauseScreen
);

if (
    uiState.currentScreen !==
    "gameover"
) {

    uiShow(
        UI.pauseButton
    );

}

}

/* =========================================================
GAME OVER
========================================================= */

function showGameOverUI(
score,
highScore,
isNewHighScore
) {

uiState.currentScreen =
    "gameover";

uiHide(
    UI.startScreen
);

uiHide(
    UI.pauseScreen
);

uiHide(
    UI.pauseButton
);

uiShow(
    UI.gameOverScreen
);

/*
 * Final score.
 */

if (
    UI.finalScoreDisplay
) {

    UI.finalScoreDisplay.textContent =
        formatScore(
            score
        );

}

/*
 * High score.

 */

if (
    UI.highScoreDisplay
) {

    UI.highScoreDisplay.textContent =
        formatScore(
            highScore
        );

}

/*
 * New high score indicator.

 */

if (
    isNewHighScore
) {

    uiShow(
        UI.newHighScore
    );

} else {

    uiHide(
        UI.newHighScore
    );

}

/*
 * Reset gameplay UI.

 */

hideCombo();

hidePowerup();

disableSpeedLines();

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

const score =
    Number(
        gameState.score ||
        0
    );

if (
    UI.scoreDisplay
) {

    UI.scoreDisplay.textContent =
        formatScore(
            score
        );

}

/*
 * SPEED
 */

const speed =
    Number(
        gameState.speed ||
        0
    );

if (
    UI.speedDisplay
) {

    UI.speedDisplay.textContent =
        `${speed.toFixed(1)}X`;

}

/*
 * SHIELD
 */

let shields =
    0;

if (
    gameState.player
) {

    shields =
        Number(
            gameState.player.shields ||
            0
        );

}

if (
    UI.shieldDisplay
) {

    UI.shieldDisplay.textContent =
        shields;

}

/*
 * COMBO
 */

const combo =
    Number(
        gameState.combo ||
        0
    );

if (
    combo > 1
) {

    showCombo(
        combo
    );

} else {

    hideCombo();

}

/*
 * POWERUP
 */

updatePowerupUI();

/*
 * Speed visual.

 */

updateSpeedEffects(
    speed
);

/*
 * Cache.

 */

uiState.lastScore =
    score;

uiState.lastSpeed =
    speed;

uiState.lastShield =
    shields;

uiState.lastCombo =
    combo;

}

/* =========================================================
SCORE FORMAT
========================================================= */

function formatScore(
value
) {

const safeValue =
    Math.max(
        0,
        Math.floor(
            Number(value) ||
            0
        )
    );

return safeValue
    .toString()
    .padStart(
        4,
        "0"
    );

}

/* =========================================================
COMBO
========================================================= */

function showCombo(
combo
) {

if (
    !UI.comboDisplay ||
    !UI.comboValue
) {

    return;

}

uiShow(
    UI.comboDisplay
);

UI.comboValue.textContent =
    combo;

/*
 * Punch animation.

 */

UI.comboDisplay.classList.remove(
    "combo-pop"
);

void UI.comboDisplay.offsetWidth;

UI.comboDisplay.classList.add(
    "combo-pop"
);

}

function hideCombo() {

uiHide(
    UI.comboDisplay
);

}

/* =========================================================
POWERUP
========================================================= */

function updatePowerupUI() {

if (
    typeof gameState ===
    "undefined"
) {

    return;

}

const active =
    gameState.activePowerup ||
    "";

if (
    !active ||
    active === "READY" ||
    active === "NORMAL"
) {

    hidePowerup();

    return;

}

let text =
    active;

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

    text =
        `TURBO ${seconds}s`;

}

showPowerup(
    text
);

}

function showPowerup(
text
) {

if (
    !UI.powerupDisplay ||
    !UI.powerupText
) {

    return;

}

uiShow(
    UI.powerupDisplay
);

UI.powerupText.textContent =
    text;

/*
 * Glow animation.

 */

UI.powerupDisplay.classList.remove(
    "powerup-pop"
);

void UI.powerupDisplay.offsetWidth;

UI.powerupDisplay.classList.add(
    "powerup-pop"
);

uiState.lastPowerup =
    text;

}

function hidePowerup() {

uiHide(
    UI.powerupDisplay
);

uiState.lastPowerup =
    "";

}

/* =========================================================
SPEED EFFECTS
========================================================= */

function updateSpeedEffects(
speed
) {

if (
    !UI.speedLines
) {

    return;

}

/*
 * Base speed.
 */

const threshold =
    7.5;

if (
    speed >= threshold
) {

    uiShow(
        UI.speedLines
    );

    /*
     * Intensitas berdasarkan kecepatan.

     */

    const intensity =
        Math.min(
            1,
            (
                speed -
                threshold
            ) /
            6
        );

    UI.speedLines.style.opacity =
        (
            0.15 +
            intensity *
            0.65
        ).toFixed(
            2
        );

} else {

    disableSpeedLines();

}

}

function enableSpeedLines() {

uiShow(
    UI.speedLines
);

}

function disableSpeedLines() {

uiHide(
    UI.speedLines
);

}

/* =========================================================
SCREEN FLASH
========================================================= */

function screenFlash(
color = "#ffffff",
duration = 120
) {

if (
    !UI.screenFlash
) {

    return;

}

if (
    uiState.flashTimeout
) {

    clearTimeout(
        uiState.flashTimeout
    );

}

UI.screenFlash.style.background =
    color;

UI.screenFlash.classList.remove(
    "flash-active"
);

void UI.screenFlash.offsetWidth;

UI.screenFlash.classList.add(
    "flash-active"
);

uiState.flashTimeout =
    setTimeout(
        () => {

            UI.screenFlash.classList.remove(
                "flash-active"
            );

        },
        duration
    );

}

/* =========================================================
FLOATING TEXT
========================================================= */

function showFloatingText(
text,
options = {}
) {

if (
    !UI.floatingTextLayer
) {

    return;

}

const {

    color = "#00ffcc",

    x = null,

    y = null,

    duration = 800,

    scale = 1

} = options;

const element =
    document.createElement(
        "div"
    );

element.className =
    "floating-score";

element.textContent =
    text;

element.style.color =
    color;

element.style.setProperty(
    "--float-scale",
    scale
);

/*
 * Posisi.

 */

if (
    x !== null &&
    y !== null
) {

    element.style.left =
        `${x}px`;

    element.style.top =
        `${y}px`;

} else {

    element.style.left =
        "50%";

    element.style.top =
        "45%";

}

UI.floatingTextLayer.appendChild(
    element
);

const id =
    ++uiState.floatingTextId;

/*
 * Fallback cleanup.

 */

setTimeout(
    () => {

        if (
            element.parentNode
        ) {

            element.remove();

        }

    },
    duration + 100
);

return id;

}

/* =========================================================
SPECIAL FEEDBACK
========================================================= */

function showNearMissFeedback(
x,
y
) {

showFloatingText(
    "NEAR MISS!",
    {

        color:
            "#ffb86c",

        x,
        y,

        scale:
            1.15

    }
);

screenFlash(
    "rgba(255,184,108,0.18)",
    100
);

}

function showShieldBreakFeedback(
x,
y
) {

showFloatingText(
    "SHIELD!",
    {

        color:
            "#00ffcc",

        x,
        y,

        scale:
            1.1

    }
);

screenFlash(
    "rgba(0,255,204,0.18)",
    120
);

}

function showTurboFeedback() {

showFloatingText(
    "TURBO!",
    {

        color:
            "#ffb86c",

        scale:
            1.3

    }
);

screenFlash(
    "rgba(255,184,108,0.2)",
    140
);

enableSpeedLines();

}

/* =========================================================
SCREEN TRANSITION
========================================================= */

function transitionToGame() {

hideStartScreen();

showGameUI();

}

function transitionToPause() {

showPauseScreen();

}

function transitionToGameOver(
score,
highScore,
isNewHighScore
) {

showGameOverUI(
    score,
    highScore,
    isNewHighScore
);

}

/* =========================================================
LOADING BOOT SEQUENCE
========================================================= */

function runLoadingSequence() {

initializeUI();

/*
 * Fake loading sequence.

 * Ini bukan loading asset sungguhan.
 * Tujuannya memberi identitas arcade
 * dan transisi yang terasa intentional.

 */

const steps = [

    {
        progress:
            12,

        text:
            "CONNECTING TO CITY GRID..."
    },

    {
        progress:
            28,

        text:
            "CALIBRATING TAXI SYSTEM..."
    },

    {
        progress:
            46,

        text:
            "SCANNING TRAFFIC NETWORK..."
    },

    {
        progress:
            64,

        text:
            "LOADING NIGHT ROUTE..."
    },

    {
        progress:
            82,

        text:
            "WARMING ENGINE..."
    },

    {
        progress:
            100,

        text:
            "NIGHT SHIFT READY."
    }

];

let index =
    0;

function nextStep() {

    if (
        index >=
        steps.length
    ) {

        finishLoading();

        return;

    }

    const step =
        steps[index];

    setLoadingProgress(
        step.progress,
        step.text
    );

    index++;

    const delay =
        index ===
        steps.length
            ? 180
            : 170;

    setTimeout(
        nextStep,
        delay
    );

}

/*
 * Mulai.

 */

setLoadingProgress(
    0,
    "INITIALIZING NIGHT SHIFT..."
);

setTimeout(
    nextStep,
    180
);

}

/* =========================================================
INITIAL UI BOOT
========================================================= */

if (
document.readyState ===
"loading"
) {

document.addEventListener(
    "DOMContentLoaded",
    runLoadingSequence
);

} else {

runLoadingSequence();

}
