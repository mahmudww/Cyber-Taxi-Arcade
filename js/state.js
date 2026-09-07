/* =========================================================
CYBER TAXI
GAME STATE

File ini menyimpan SEMUA kondisi game.

State = "game sedang dalam kondisi apa?"

State TIDAK bertanggung jawab terhadap:

rendering
collision logic
audio
input
spawning
Player movement → player.js
Traffic → traffic.js
Powerups → powerups.js
Effects → effects.js
========================================================= */

/* =========================================================
GAME STATE
========================================================= */

const gameState = {

/* =====================================================
   FLOW
   ===================================================== */

isPlaying: false,

isPaused: false,

isGameOver: false,

isInitialized: false,


/* =====================================================
   SCORE
   ===================================================== */

score:
    GAME_CONFIG.SCORE.startingScore,

highScore: 0,

combo:
    GAME_CONFIG.COMBO.startingCombo,

comboTimer: 0,

lastScoreMilestone: 0,


/* =====================================================
   PLAYER
   ===================================================== */

player: {

    lane:
        GAME_CONFIG.PLAYER.startingLane,

    targetLane:
        GAME_CONFIG.PLAYER.startingLane,

    x: 0,

    targetX: 0,

    y: 0,

    width:
        GAME_CONFIG.ROAD.playerWidth,

    height:
        GAME_CONFIG.ROAD.playerHeight,

    shields: 0,

    isInvulnerable: false,

    invulnerabilityTimer: 0

},


/* =====================================================
   SPEED
   ===================================================== */

speed:
    GAME_CONFIG.SPEED.startingSpeed,

currentSpeed:
    GAME_CONFIG.SPEED.startingSpeed,

turboActive: false,

turboTimer: 0,


/* =====================================================
   ROAD
   ===================================================== */

roadOffset: 0,


/* =====================================================
   SPAWNING
   ===================================================== */

spawnTimer: 0,

powerupSpawnTimer:
    GAME_CONFIG.POWERUPS.startingDelay,

trafficCount: 0,


/* =====================================================
   GAME TIME
   ===================================================== */

elapsedFrames: 0,

elapsedSeconds: 0,


/* =====================================================
   EFFECTS
   ===================================================== */

screenShakeTimer: 0,

screenShakeIntensity: 0,

flashTimer: 0,

flashColor: "#ffffff",


/* =====================================================
   POWERUP DISPLAY
   ===================================================== */

activePowerupName: "READY",

activePowerupType: null,


/* =====================================================
   PERFORMANCE
   ===================================================== */

lastFrameTime: 0,

deltaTime: 0,

fps: 60

};

/* =========================================================
ENTITY ARRAYS

Entity yang bergerak di dunia game disimpan terpisah
dari gameState utama.

Ini membuat state lebih mudah dikelola.
========================================================= */

const entities = {

obstacles: [],

powerups: [],

particles: [],

floatingTexts: [],

roadEffects: []

};

/* =========================================================
RESET GAME STATE

Dipanggil setiap kali pemain memulai game baru.

IMPORTANT:
Fungsi ini TIDAK membutuhkan canvas.

Posisi dan ukuran player ditangani oleh player.js.
========================================================= */

function resetGameState() {

/* =====================================================
   FLOW
   ===================================================== */

gameState.isPlaying = false;

gameState.isPaused = false;

gameState.isGameOver = false;

gameState.isInitialized = false;


/* =====================================================
   SCORE
   ===================================================== */

gameState.score =
    GAME_CONFIG.SCORE.startingScore;

gameState.combo =
    GAME_CONFIG.COMBO.startingCombo;

gameState.comboTimer = 0;

gameState.lastScoreMilestone = 0;


/* =====================================================
   PLAYER
   ===================================================== */

gameState.player.lane =
    GAME_CONFIG.PLAYER.startingLane;

gameState.player.targetLane =
    GAME_CONFIG.PLAYER.startingLane;

gameState.player.x = 0;

gameState.player.targetX = 0;

gameState.player.y = 0;

gameState.player.width =
    GAME_CONFIG.ROAD.playerWidth;

gameState.player.height =
    GAME_CONFIG.ROAD.playerHeight;

gameState.player.shields = 0;

gameState.player.isInvulnerable = false;

gameState.player.invulnerabilityTimer = 0;


/* =====================================================
   SPEED
   ===================================================== */

gameState.speed =
    GAME_CONFIG.SPEED.startingSpeed;

gameState.currentSpeed =
    GAME_CONFIG.SPEED.startingSpeed;

gameState.turboActive = false;

gameState.turboTimer = 0;


/* =====================================================
   ROAD
   ===================================================== */

gameState.roadOffset = 0;


/* =====================================================
   SPAWNING
   ===================================================== */

gameState.spawnTimer = 0;

gameState.powerupSpawnTimer =
    GAME_CONFIG.POWERUPS.startingDelay;

gameState.trafficCount = 0;


/* =====================================================
   TIME
   ===================================================== */

gameState.elapsedFrames = 0;

gameState.elapsedSeconds = 0;


/* =====================================================
   EFFECTS
   ===================================================== */

gameState.screenShakeTimer = 0;

gameState.screenShakeIntensity = 0;

gameState.flashTimer = 0;

gameState.flashColor = "#ffffff";


/* =====================================================
   POWERUP DISPLAY
   ===================================================== */

gameState.activePowerupName =
    "READY";

gameState.activePowerupType =
    null;


/* =====================================================
   PERFORMANCE
   ===================================================== */

gameState.lastFrameTime = 0;

gameState.deltaTime = 0;

gameState.fps = 60;


/* =====================================================
   CLEAR ENTITIES
   ===================================================== */

entities.obstacles.length = 0;

entities.powerups.length = 0;

entities.particles.length = 0;

entities.floatingTexts.length = 0;

entities.roadEffects.length = 0;


/* =====================================================
   LOAD HIGH SCORE
   ===================================================== */

loadHighScore();

}

/* =========================================================
START GAME STATE
========================================================= */

function startGameState() {

resetGameState();

gameState.isPlaying = true;

gameState.isPaused = false;

gameState.isGameOver = false;

gameState.isInitialized = true;

}

/* =========================================================
PAUSE GAME
========================================================= */

function pauseGameState() {

if (!gameState.isPlaying) {
    return;
}

gameState.isPaused = true;

}

/* =========================================================
RESUME GAME
========================================================= */

function resumeGameState() {

if (!gameState.isPlaying) {
    return;
}

gameState.isPaused = false;

}

/* =========================================================
TOGGLE PAUSE
========================================================= */

function togglePauseState() {

if (!gameState.isPlaying) {
    return;
}

gameState.isPaused =
    !gameState.isPaused;

}

/* =========================================================
END GAME
========================================================= */

function endGameState() {

gameState.isPlaying = false;

gameState.isPaused = false;

gameState.isGameOver = true;


/* =====================================================
   HIGH SCORE
   ===================================================== */

const finalScore =
    Math.floor(
        gameState.score
    );


if (
    finalScore >
    gameState.highScore
) {

    gameState.highScore =
        finalScore;

    saveHighScore();

}

}

/* =========================================================
MOVE PLAYER STATE

Player.js bertanggung jawab terhadap smoothing.
State hanya menyimpan target lane.
========================================================= */

function setPlayerLane(
lane,
canvas
) {

if (!gameState.isPlaying) {
    return;
}

if (gameState.isPaused) {
    return;
}


const maxLane =
    GAME_CONFIG.ROAD.laneCount - 1;


const newLane =
    clamp(
        lane,
        0,
        maxLane
    );


if (
    newLane ===
    gameState.player.targetLane
) {

    return;

}


gameState.player.targetLane =
    newLane;


/*
 * Canvas tetap diterima untuk kompatibilitas
 * dengan input.js versi sekarang.
 *
 * Player.js akan menghitung posisi aktual.
 */

if (canvas) {

    const lanes =
        getLanePositions(
            canvas.width
        );


    if (lanes[newLane] !== undefined) {

        gameState.player.targetX =
            lanes[newLane];

    }

}

}

/* =========================================================
MOVE PLAYER RELATIVE
========================================================= */

function movePlayerState(
direction,
canvas
) {

if (!gameState.isPlaying) {
    return;
}

if (gameState.isPaused) {
    return;
}


const newLane =
    gameState.player.targetLane +
    direction;


setPlayerLane(
    newLane,
    canvas
);

}

/* =========================================================
ADD SCORE
========================================================= */

function addScore(amount) {

if (!gameState.isPlaying) {
    return;
}

if (amount <= 0) {
    return;
}


gameState.score += amount;


/*
 * Score tidak boleh negatif.
 */

if (gameState.score < 0) {

    gameState.score = 0;

}

}

/* =========================================================
COMBO
========================================================= */

function increaseCombo(
amount = 1
) {

if (
    !GAME_CONFIG.COMBO.enabled
) {

    return;

}


gameState.combo =
    clamp(

        gameState.combo + amount,

        0,

        GAME_CONFIG.COMBO.maximumCombo

    );


gameState.comboTimer =
    GAME_CONFIG.COMBO.comboTimeout;

}

/* =========================================================
RESET COMBO
========================================================= */

function resetCombo() {

gameState.combo =
    GAME_CONFIG.COMBO.startingCombo;

gameState.comboTimer = 0;

}

/* =========================================================
COMBO UPDATE
========================================================= */

function updateComboTimer() {

if (
    !GAME_CONFIG.COMBO.enabled
) {

    return;

}


if (
    gameState.combo <= 0
) {

    return;

}


if (
    gameState.comboTimer > 0
) {

    gameState.comboTimer--;

}


if (
    gameState.comboTimer <= 0
) {

    resetCombo();

}

}

/* =========================================================
TURBO
========================================================= */

function activateTurbo() {

gameState.turboActive =
    true;


gameState.turboTimer =
    GAME_CONFIG.POWERUPS.turboDuration;


gameState.activePowerupType =
    "turbo";


gameState.activePowerupName =
    "TURBO BOOST!";

}

/* =========================================================
DEACTIVATE TURBO
========================================================= */

function deactivateTurbo() {

gameState.turboActive =
    false;

gameState.turboTimer = 0;

gameState.activePowerupType =
    null;

gameState.activePowerupName =
    "NORMAL";

}

/* =========================================================
TURBO TIMER
========================================================= */

function updateTurboTimer() {

if (
    !gameState.turboActive
) {

    return;

}


if (
    gameState.turboTimer > 0
) {

    gameState.turboTimer--;

}


if (
    gameState.turboTimer <= 0
) {

    deactivateTurbo();

}

}

/* =========================================================
SHIELD
========================================================= */

function addShield(
amount = 1
) {

gameState.player.shields =
    clamp(

        gameState.player.shields + amount,

        0,

        GAME_CONFIG.POWERUPS.maximumShields

    );


gameState.activePowerupType =
    "shield";


gameState.activePowerupName =
    `SHIELD +${amount}`;

}

/* =========================================================
REMOVE SHIELD
========================================================= */

function removeShield() {

if (
    gameState.player.shields <= 0
) {

    return false;

}


gameState.player.shields--;

return true;

}

/* =========================================================
INVULNERABILITY
========================================================= */

function activateInvulnerability(
frames = 45
) {

gameState.player.isInvulnerable =
    true;


gameState.player.invulnerabilityTimer =
    frames;

}

/* =========================================================
UPDATE INVULNERABILITY
========================================================= */

function updateInvulnerability() {

if (
    !gameState.player.isInvulnerable
) {

    return;

}


if (
    gameState.player.invulnerabilityTimer > 0
) {

    gameState.player.invulnerabilityTimer--;

}


if (
    gameState.player.invulnerabilityTimer <= 0
) {

    gameState.player.isInvulnerable =
        false;

}

}

/* =========================================================
SCREEN SHAKE
========================================================= */

function triggerScreenShake(
duration,
intensity
) {

gameState.screenShakeTimer =
    Math.max(

        gameState.screenShakeTimer,

        duration

    );


gameState.screenShakeIntensity =
    Math.max(

        gameState.screenShakeIntensity,

        intensity

    );

}

/* =========================================================
UPDATE SCREEN SHAKE
========================================================= */

function updateScreenShake() {

if (
    gameState.screenShakeTimer > 0
) {

    gameState.screenShakeTimer--;

}


if (
    gameState.screenShakeTimer <= 0
) {

    gameState.screenShakeIntensity = 0;

}

}

/* =========================================================
FLASH
========================================================= */

function triggerFlash(
color = "#ffffff",
duration = 8
) {

gameState.flashColor =
    color;


gameState.flashTimer =
    duration;

}

/* =========================================================
UPDATE FLASH
========================================================= */

function updateFlash() {

if (
    gameState.flashTimer > 0
) {

    gameState.flashTimer--;

}

}

/* =========================================================
GAME TIME
========================================================= */

function updateGameTime() {

if (
    !gameState.isPlaying
) {

    return;

}


if (
    gameState.isPaused
) {

    return;

}


gameState.elapsedFrames++;


gameState.elapsedSeconds =
    gameState.elapsedFrames / 60;

}

/* =========================================================
HIGH SCORE
========================================================= */

function loadHighScore() {

if (
    !GAME_CONFIG.GAME.enableHighScore
) {

    gameState.highScore = 0;

    return;

}


try {

    const saved =
        localStorage.getItem(

            GAME_CONFIG.GAME.highScoreStorageKey

        );


    gameState.highScore =
        saved
            ? Number(saved)
            : 0;


    if (
        !Number.isFinite(
            gameState.highScore
        )
    ) {

        gameState.highScore = 0;

    }

} catch (error) {

    console.warn(
        "Unable to load high score.",
        error
    );


    gameState.highScore = 0;

}

}

/* =========================================================
SAVE HIGH SCORE
========================================================= */

function saveHighScore() {

if (
    !GAME_CONFIG.GAME.enableHighScore
) {

    return;

}


try {

    localStorage.setItem(

        GAME_CONFIG.GAME.highScoreStorageKey,

        String(

            Math.floor(
                gameState.highScore
            )

        )

    );

} catch (error) {

    console.warn(
        "Unable to save high score.",
        error
    );

}

}

/* =========================================================
CHECK NEW HIGH SCORE
========================================================= */

function isNewHighScore() {

return (

    Math.floor(
        gameState.score
    ) >

    gameState.highScore

);

}

/* =========================================================
RESET HIGH SCORE

Tidak dipanggil oleh game normal.

Bisa digunakan nanti untuk:
Settings > Reset High Score
========================================================= */

function resetHighScore() {

gameState.highScore = 0;


try {

    localStorage.removeItem(

        GAME_CONFIG.GAME.highScoreStorageKey

    );

} catch (error) {

    console.warn(
        "Unable to reset high score.",
        error
    );

}

}
