/* =========================================================
CYBER TAXI
GAME CONFIGURATION

Semua angka penting untuk gameplay dikumpulkan di sini.

Kalau nanti mau:

game lebih cepat
traffic lebih padat
score lebih tinggi
power-up lebih sering
lane lebih lebar
difficulty lebih brutal

...kita cukup mengubah file ini.

Jangan taruh logic gameplay di sini.
File ini hanya berisi CONFIGURATION.
========================================================= */

const GAME_CONFIG = {

/* =====================================================
   CANVAS / ROAD
   ===================================================== */

ROAD: {

    laneCount: 3,

    laneWidth: 75,

    sideMargin: 18,

    playerWidth: 44,

    playerHeight: 84,

    obstacleWidth: 44,

    obstacleHeight: 84

},


/* =====================================================
   PLAYER
   ===================================================== */

PLAYER: {

    startingLane: 1,

    bottomOffset: 110,

    moveDuration: 90,

    maxShields: 3

},


/* =====================================================
   SPEED
   ===================================================== */

SPEED: {

    startingSpeed: 4.5,

    minimumSpeed: 4.5,

    maximumSpeed: 13,

    scoreAcceleration: 0.022,

    turboMultiplier: 1.8,

    turboDuration: 180

},


/* =====================================================
   SCORE
   ===================================================== */

SCORE: {

    startingScore: 0,

    normalPerFrame: 0.3,

    turboPerFrame: 0.8,

    nearMissBonus: 10,

    shieldSaveBonus: 25,

    powerupBonus: 15,

    comboBonusMultiplier: 1.25

},


/* =====================================================
   TRAFFIC
   ===================================================== */

TRAFFIC: {

    startingSpawnInterval: 45,

    minimumSpawnInterval: 20,

    difficultyStep: 150,

    spawnAcceleration: 1,

    minimumSafeGap: 110,

    maximumCarsOnScreen: 7,

    firstSpawnDelay: 35

},


/* =====================================================
   POWERUPS
   ===================================================== */

POWERUPS: {

    spawnInterval: 160,

    startingDelay: 120,

    shieldChance: 0.55,

    turboChance: 0.45,

    shieldSize: 34,

    turboSize: 34,

    shieldDuration: 0,

    turboDuration: 180,

    maximumShields: 3

},


/* =====================================================
   COMBO
   ===================================================== */

COMBO: {

    enabled: true,

    nearMissDistance: 24,

    startingCombo: 0,

    maximumCombo: 99,

    comboTimeout: 120,

    comboStep: 1

},


/* =====================================================
   EFFECTS
   ===================================================== */

EFFECTS: {

    roadDashLength: 20,

    roadDashGap: 20,

    screenShakeShield: 15,

    screenShakeCrash: 30,

    particleMoveCount: 6,

    particleShieldCount: 18,

    particlePowerupCount: 15,

    particleCrashCount: 25,

    speedLineThreshold: 8,

    speedLineTurboThreshold: 6

},


/* =====================================================
   AUDIO
   ===================================================== */

AUDIO: {

    engineFrequency: 55,

    engineVolume: 0.015,

    musicVolume: 0.03,

    soundVolume: 0.08,

    musicInterval: 250,

    enabled: true

},


/* =====================================================
   INPUT
   ===================================================== */

INPUT: {

    swipeThreshold: 35,

    tapMovementEnabled: true,

    keyboardEnabled: true,

    preventScroll: true

},


/* =====================================================
   VISUAL
   ===================================================== */

VISUAL: {

    roadColor: "#0d1117",

    sidewalkColor: "#161b22",

    laneColor: "#00ffcc",

    playerColor: "#00ffcc",

    obstacleColor: "#ff0066",

    powerupShieldColor: "#00ffcc",

    powerupTurboColor: "#ffb86c",

    scanlineSpacing: 4,

    scanlineAlpha: 0.15

},


/* =====================================================
   GAME FLOW
   ===================================================== */

GAME: {

    targetFPS: 60,

    autoPauseOnBlur: true,

    showLoadingScreen: true,

    enableHighScore: true,

    highScoreStorageKey: "cyberTaxiHighScore"

}


};

/* =========================================================
HELPER FUNCTIONS
========================================================= */

/**

Mendapatkan speed berdasarkan score.

Speed akan naik perlahan seiring pemain

semakin lama bertahan.
*/
function getGameSpeed(score) {

const speed =
GAME_CONFIG.SPEED.minimumSpeed +
score * GAME_CONFIG.SPEED.scoreAcceleration;

return Math.min(
speed,
GAME_CONFIG.SPEED.maximumSpeed
);
}

/**

Mendapatkan kecepatan aktual.

Turbo membuat mobil bergerak lebih cepat.
*/
function getCurrentSpeed(score, turboActive) {

const baseSpeed = getGameSpeed(score);

if (turboActive) {

 return Math.min(
     baseSpeed * GAME_CONFIG.SPEED.turboMultiplier,
     GAME_CONFIG.SPEED.maximumSpeed *
     GAME_CONFIG.SPEED.turboMultiplier
 );


}

return baseSpeed;
}

/**

Mendapatkan interval spawn traffic.

Semakin tinggi score,

semakin sering mobil muncul.
*/
function getTrafficSpawnInterval(score) {

const difficulty =
Math.floor(
score /
GAME_CONFIG.TRAFFIC.difficultyStep
);

const interval =
GAME_CONFIG.TRAFFIC.startingSpawnInterval -
difficulty *
GAME_CONFIG.TRAFFIC.spawnAcceleration;

return Math.max(
GAME_CONFIG.TRAFFIC.minimumSpawnInterval,
interval
);
}

/**

Mendapatkan posisi lane.

Kita menggunakan posisi tengah canvas

supaya otomatis responsive.
*/
function getLanePositions(canvasWidth) {

const center = canvasWidth / 2;

const width = GAME_CONFIG.ROAD.laneWidth;

return [

 center - width,

 center,

 center + width


];
}

/**

Mendapatkan posisi Y player.
*/
function getPlayerY(canvasHeight) {

return (
canvasHeight -
GAME_CONFIG.PLAYER.bottomOffset
);
}

/**

Random integer inclusive.
*/
function randomInt(min, max) {

return Math.floor(
Math.random() * (max - min + 1)
) + min;
}

/**

Random item dari array.
*/
function randomItem(array) {

return array[
Math.floor(
Math.random() * array.length
)
];

}

/**

Clamp angka agar tetap berada

di antara min dan max.
*/
function clamp(value, min, max) {

return Math.max(
min,
Math.min(max, value)
);

}
