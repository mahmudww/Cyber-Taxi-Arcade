/* =========================================================
CYBER TAXI
POWER-UP SYSTEM
Mengatur:

spawning power-up
Shield
Turbo
collision dengan player
timer
visual state
pickup feedback
power-up balancing
POWER-UP PHILOSOPHY

SHIELD
Memberi satu kesempatan tambahan ketika menabrak.

TURBO
Dunia menjadi jauh lebih cepat.
Score bertambah lebih cepat.
Risiko juga meningkat.

Tujuan:
Power-up harus membuat pemain berpikir:

"Gue ambil nggak nih?"

========================================================= */

/* =========================================================
POWER-UP TYPES
========================================================= */

const POWERUP_TYPES = {

shield: {

    name:
        "SHIELD",

    shortName:
        "S",

    color:
        "#00ffcc",

    glowColor:
        "rgba(0, 255, 204, 0.8)",

    duration:
        0,

    spawnWeight:
        55,

    scoreBonus:
        25

},

turbo: {

    name:
        "TURBO",

    shortName:
        "T",

    color:
        "#ffb86c",

    glowColor:
        "rgba(255, 184, 108, 0.85)",

    duration:
        180,

    spawnWeight:
        45,

    scoreBonus:
        40

}

};

/* =========================================================
POWER-UP STATE
========================================================= */

const powerupState = {

spawnTimer: 0,

totalSpawned: 0,

totalCollected: 0,

shieldsCollected: 0,

turbosCollected: 0,

lastSpawnLane: -1,

lastType:
    null,

turboRemaining: 0,

pickupFlash: 0,

pickupText:
    "",

pickupTextTimer: 0

};

/* =========================================================
INITIALIZE
========================================================= */

function initPowerups() {

resetPowerupState();

}

/* =========================================================
RESET
========================================================= */

function resetPowerupState() {

powerupState.spawnTimer = 0;

powerupState.totalSpawned = 0;

powerupState.totalCollected = 0;

powerupState.shieldsCollected = 0;

powerupState.turbosCollected = 0;

powerupState.lastSpawnLane = -1;

powerupState.lastType = null;

powerupState.turboRemaining = 0;

powerupState.pickupFlash = 0;

powerupState.pickupText = "";

powerupState.pickupTextTimer = 0;

gameState.turboActive =
    false;

gameState.turboTimer =
    0;

}

/* =========================================================
MAIN UPDATE
========================================================= */

function updatePowerups(canvas) {

if (!gameState.isPlaying) {

    return;

}

if (gameState.isPaused) {

    return;

}

updatePowerupSpawner();

updatePowerupObjects(canvas);

updateTurbo();

updatePickupFeedback();

}

/* =========================================================
SPAWNER
========================================================= */

function updatePowerupSpawner() {

powerupState.spawnTimer++;

const interval =
    getPowerupSpawnInterval();

if (
    powerupState.spawnTimer <
    interval
) {

    return;

}

powerupState.spawnTimer = 0;

spawnPowerup();

}

/* =========================================================
SPAWN INTERVAL
========================================================= */

function getPowerupSpawnInterval() {

/*
 * Power-up tidak boleh terlalu sering.

 * Di awal:
 * sekitar 8-10 detik.

 * Saat game semakin sulit:
 * bisa sedikit lebih sering.
 */

const difficulty =
    typeof getTrafficDifficulty ===
    "function"

        ? getTrafficDifficulty()

        : 0;

const base =
    GAME_CONFIG.POWERUPS.spawnInterval;

const reduction =
    difficulty *
    GAME_CONFIG.POWERUPS.difficultySpawnReduction;

return Math.max(

    GAME_CONFIG.POWERUPS.minimumSpawnInterval,

    Math.floor(
        base - reduction
    )

);

}

/* =========================================================
SPAWN POWER-UP
========================================================= */

function spawnPowerup() {

if (
    typeof entities === "undefined"
) {

    return;

}

const lane =
    choosePowerupLane();

if (
    lane === -1
) {

    return;

}

const type =
    choosePowerupType();

const config =
    POWERUP_TYPES[type];

const powerup = {

    id:
        `powerup_${Date.now()}_${Math.random()}`,

    lane:
        lane,

    type:
        type,

    x:
        0,

    y:
        -70,

    size:
        GAME_CONFIG.POWERUPS.size,

    rotation:
        0,

    pulse:
        Math.random() *
        Math.PI *
        2,

    life:
        0,

    collected:
        false

};

entities.powerups.push(
    powerup
);

powerupState.totalSpawned++;

powerupState.lastSpawnLane =
    lane;

powerupState.lastType =
    type;

if (
    typeof playPowerupSpawnSound ===
    "function"
) {

    playPowerupSpawnSound(
        type
    );

}

}

/* =========================================================
CHOOSE POWER-UP LANE
========================================================= */

function choosePowerupLane() {

const laneCount =
    GAME_CONFIG.ROAD.laneCount;

const candidates = [];

for (
    let lane = 0;
    lane < laneCount;
    lane++
) {

    if (
        lane ===
        powerupState.lastSpawnLane
    ) {

        continue;

    }

    if (
        isPowerupLaneDangerous(
            lane
        )
    ) {

        continue;

    }

    candidates.push(
        lane
    );

}

if (
    candidates.length === 0
) {

    return -1;

}

return candidates[
    Math.floor(
        Math.random() *
        candidates.length
    )
];

}

/* =========================================================
CHECK POWER-UP LANE DANGER
========================================================= */

function isPowerupLaneDangerous(
lane
) {

if (
    typeof entities === "undefined"
) {

    return false;

}

/*
 * Jangan spawn power-up tepat di depan
 * kendaraan lain.

 * Ini menjaga power-up tetap fair.
 */

for (
    const vehicle of
    entities.traffic
) {

    if (
        vehicle.lane !== lane
    ) {

        continue;

    }

    if (
        vehicle.y > -160 &&
        vehicle.y < 180
    ) {

        return true;

    }

}

return false;

}

/* =========================================================
CHOOSE TYPE
========================================================= */

function choosePowerupType() {

const entries =
    Object.entries(
        POWERUP_TYPES
    );

let totalWeight = 0;

for (
    const [, config]
    of entries
) {

    totalWeight +=
        config.spawnWeight;

}

let random =
    Math.random() *
    totalWeight;

for (
    const [name, config]
    of entries
) {

    random -=
        config.spawnWeight;

    if (
        random <= 0
    ) {

        return name;

    }

}

return "shield";

}

/* =========================================================
UPDATE POWER-UP OBJECTS
========================================================= */

function updatePowerupObjects(canvas) {

if (
    typeof entities === "undefined"
) {

    return;

}

const worldSpeed =
    getWorldSpeed();

for (
    let i =
        entities.powerups.length - 1;

    i >= 0;

    i--
) {

    const powerup =
        entities.powerups[i];

    powerup.y +=
        worldSpeed;

    powerup.life++;

    powerup.rotation +=
        GAME_CONFIG.POWERUPS.rotationSpeed;

    powerup.pulse +=
        GAME_CONFIG.POWERUPS.pulseSpeed;

    /*
     * Collision.
     */

    if (
        checkPowerupCollision(
            powerup
        )
    ) {

        collectPowerup(
            powerup
        );

        entities.powerups.splice(
            i,
            1
        );

        continue;

    }

    /*
     * Cleanup.
     */

    if (
        powerup.y >
        canvas.height +
        100
    ) {

        entities.powerups.splice(
            i,
            1
        );

    }

}

}

/* =========================================================
POWER-UP COLLISION
========================================================= */

function checkPowerupCollision(
powerup
) {

const rect = {

    x:
        powerup.x -
        powerup.size / 2,

    y:
        powerup.y,

    width:
        powerup.size,

    height:
        powerup.size

};

if (
    typeof playerIntersectsRect !==
    "function"
) {

    return false;

}

return playerIntersectsRect(
    rect
);

}

/* =========================================================
COLLECT POWER-UP
========================================================= */

function collectPowerup(
powerup
) {

if (
    powerup.collected
) {

    return;

}

powerup.collected =
    true;

const config =
    POWERUP_TYPES[
        powerup.type
    ];

powerupState.totalCollected++;

/*
 * Score bonus.
 */

gameState.score +=
    config.scoreBonus;

/*
 * Apply effect.
 */

if (
    powerup.type ===
    "shield"
) {

    activateShield();

}

if (
    powerup.type ===
    "turbo"
) {

    activateTurbo();

}

/*
 * Feedback.
 */

showPowerupPickupText(
    config.name
);

powerupState.pickupFlash =
    8;

createPowerupPickupEffect(
    powerup
);

playPowerupPickupSound(
    powerup.type
);

}

/* =========================================================
SHIELD
========================================================= */

function activateShield() {

const maxShields =
    GAME_CONFIG.POWERUPS.maxShields;

if (
    gameState.player.shields <
    maxShields
) {

    gameState.player.shields++;

    powerupState.shieldsCollected++;

    /*
     * Shield baru langsung terasa.
     */

    gameState.activePowerup =
        "SHIELD";

} else {

    /*
     * Kalau shield sudah penuh,
     * jangan buang pickup sia-sia.

     * Berikan sedikit score sebagai kompensasi.
     */

    gameState.score +=
        GAME_CONFIG.POWERUPS.fullShieldBonus;

}

if (
    typeof createShieldActivateEffect ===
    "function"
) {

    createShieldActivateEffect(

        gameState.player.x,

        gameState.player.y

    );

}

}

/* =========================================================
REMOVE SHIELD
========================================================= */

function removeShield() {

if (
    gameState.player.shields <= 0
) {

    return;

}

gameState.player.shields--;

if (
    gameState.player.shields <= 0 &&
    !gameState.turboActive
) {

    gameState.activePowerup =
        "READY";

}

showPowerupPickupText(
    "SHIELD BROKEN"
);

}

/* =========================================================
TURBO
========================================================= */

function activateTurbo() {

const duration =
    POWERUP_TYPES.turbo.duration;

gameState.turboActive =
    true;

gameState.turboTimer =
    duration;

powerupState.turboRemaining =
    duration;

powerupState.turbosCollected++;

gameState.activePowerup =
    "TURBO";

/*
 * Turbo activation effect.
 */

if (
    typeof createTurboActivateEffect ===
    "function"
) {

    createTurboActivateEffect(

        gameState.player.x,

        gameState.player.y

    );

}

if (
    typeof triggerScreenFlash ===
    "function"
) {

    triggerScreenFlash(
        "#ffb86c",
        5
    );

}

}

/* =========================================================
UPDATE TURBO
========================================================= */

function updateTurbo() {

if (
    !gameState.turboActive
) {

    return;

}

if (
    gameState.turboTimer >
    0
) {

    gameState.turboTimer--;

}

powerupState.turboRemaining =
    gameState.turboTimer;

/*
 * Extra score ketika turbo aktif.
 */

gameState.score +=
    GAME_CONFIG.POWERUPS.turboScorePerFrame;

if (
    gameState.turboTimer <=
    0
) {

    deactivateTurbo();

}

}

/* =========================================================
DEACTIVATE TURBO
========================================================= */

function deactivateTurbo() {

gameState.turboActive =
    false;

gameState.turboTimer =
    0;

powerupState.turboRemaining =
    0;

if (
    gameState.player.shields >
    0
) {

    gameState.activePowerup =
        "SHIELD";

} else {

    gameState.activePowerup =
        "READY";

}

if (
    typeof createTurboEndEffect ===
    "function"
) {

    createTurboEndEffect(

        gameState.player.x,

        gameState.player.y

    );

}

}

/* =========================================================
PICKUP TEXT
========================================================= */

function showPowerupPickupText(
text
) {

powerupState.pickupText =
    text;

powerupState.pickupTextTimer =
    GAME_CONFIG.POWERUPS.pickupTextDuration;

}

/* =========================================================
PICKUP FEEDBACK
========================================================= */

function updatePickupFeedback() {

if (
    powerupState.pickupFlash >
    0
) {

    powerupState.pickupFlash--;

}

if (
    powerupState.pickupTextTimer >
    0
) {

    powerupState.pickupTextTimer--;

}

}

/* =========================================================
CREATE PICKUP EFFECT
========================================================= */

function createPowerupPickupEffect(
powerup
) {

if (
    typeof createPickupParticles ===
    "function"
) {

    createPickupParticles(

        powerup.x,

        powerup.y,

        POWERUP_TYPES[
            powerup.type
        ].color

    );

}

}

/* =========================================================
POWER-UP DISPLAY INFO
========================================================= */

function getPowerupDisplayInfo() {

return {

    active:
        gameState.activePowerup,

    shield:
        gameState.player.shields,

    turbo:
        gameState.turboActive,

    turboTimer:
        gameState.turboTimer,

    pickupText:
        powerupState.pickupText,

    pickupTextTimer:
        powerupState.pickupTextTimer,

    pickupFlash:
        powerupState.pickupFlash

};

}

/* =========================================================
GET POWER-UP DRAW DATA
========================================================= */

function getPowerupDrawData(
powerup
) {

const config =
    POWERUP_TYPES[
        powerup.type
    ];

const pulse =
    Math.sin(
        powerup.pulse
    );

return {

    x:
        powerup.x,

    y:
        powerup.y,

    size:
        powerup.size +
        pulse * 2,

    rotation:
        powerup.rotation,

    color:
        config.color,

    glowColor:
        config.glowColor,

    label:
        config.shortName

};

}

/* =========================================================
RESIZE
========================================================= */

function resizePowerups(canvas) {

/*
 * X position dihitung berdasarkan lane
 * saat renderer menggambar.

 * Y tidak perlu diubah.
 */

}

/* =========================================================
CLEAR
========================================================= */

function clearPowerups() {

if (
    typeof entities === "undefined"
) {

    return;

}

entities.powerups.length = 0;

}

/* =========================================================
DEBUG
========================================================= */

function getPowerupDebugInfo() {

return {

    active:
        gameState.activePowerup,

    shields:
        gameState.player.shields,

    turbo:
        gameState.turboActive,

    turboTimer:
        gameState.turboTimer,

    spawned:
        powerupState.totalSpawned,

    collected:
        powerupState.totalCollected,

    shieldPickups:
        powerupState.shieldsCollected,

    turboPickups:
        powerupState.turbosCollected

};

}
