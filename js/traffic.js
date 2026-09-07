/* =========================================================
CYBER TAXI
TRAFFIC SYSTEM
Mengatur:

spawning kendaraan
movement kendaraan
variasi kendaraan
traffic density
difficulty scaling
collision dengan player
near miss
despawn kendaraan
visual data untuk renderer
Filosofi gameplay:

EASY
↓
kendaraan sedikit
↓
pemain belajar lane switching
↓
traffic makin cepat
↓
traffic makin padat
↓
pemain mulai mengambil risiko
↓
near-miss + combo
↓
CHAOS

========================================================= */

/* =========================================================
TRAFFIC STATE
========================================================= */

const trafficState = {

spawnTimer: 0,

distance: 0,

totalSpawned: 0,

totalPassed: 0,

nearMisses: 0,

difficulty: 0,

lastSpawnLane: -1,

lastSpawnTime: 0,

patternCooldown: 0

};

/* =========================================================
TRAFFIC TYPES
========================================================= */

const TRAFFIC_TYPES = {

sedan: {

    width: 44,

    height: 84,

    color: "#ff0066",

    speedMultiplier: 0.92,

    scoreValue: 10,

    weight: 45

},

sports: {

    width: 42,

    height: 78,

    color: "#ff3d8d",

    speedMultiplier: 1.08,

    scoreValue: 15,

    weight: 25

},

van: {

    width: 48,

    height: 92,

    color: "#8b5cf6",

    speedMultiplier: 0.78,

    scoreValue: 20,

    weight: 18

},

neon: {

    width: 40,

    height: 80,

    color: "#00aaff",

    speedMultiplier: 1.18,

    scoreValue: 25,

    weight: 12

}

};

/* =========================================================
INITIALIZE TRAFFIC
========================================================= */

function initTraffic() {

resetTrafficState();

}

/* =========================================================
RESET TRAFFIC
========================================================= */

function resetTrafficState() {

trafficState.spawnTimer = 0;

trafficState.distance = 0;

trafficState.totalSpawned = 0;

trafficState.totalPassed = 0;

trafficState.nearMisses = 0;

trafficState.difficulty = 0;

trafficState.lastSpawnLane = -1;

trafficState.lastSpawnTime = 0;

trafficState.patternCooldown = 0;

if (
    typeof entities !== "undefined"
) {

    entities.traffic.length = 0;

}

}

/* =========================================================
MAIN TRAFFIC UPDATE
========================================================= */

function updateTraffic(canvas) {

if (!gameState.isPlaying) {

    return;

}

if (gameState.isPaused) {

    return;

}

updateTrafficDifficulty();

updateTrafficSpawner(canvas);

updateTrafficVehicles(canvas);

cleanupTraffic(canvas);

}

/* =========================================================
DIFFICULTY
Difficulty naik perlahan berdasarkan score.

Kita sengaja tidak menggunakan kenaikan linear brutal.
Game harus terasa semakin tegang, bukan semakin curang.
========================================================= */

function updateTrafficDifficulty() {

/*
 * 0.0 = awal game
 *
 * 1.0 = mulai padat
 *
 * 2.0 = sulit
 *
 * 3.0+ = chaos
 */

const score =
    gameState.score;

trafficState.difficulty =
    Math.min(

        4,

        score /
        GAME_CONFIG.DIFFICULTY.scorePerLevel

    );

}

/* =========================================================
SPAWN UPDATE
========================================================= */

function updateTrafficSpawner(canvas) {

trafficState.spawnTimer++;

if (
    trafficState.patternCooldown >
    0
) {

    trafficState.patternCooldown--;

}

const interval =
    getTrafficSpawnInterval();

if (
    trafficState.spawnTimer <
    interval
) {

    return;

}

trafficState.spawnTimer = 0;

/*
 * Kadang spawn pattern,
 * tetapi jangan terlalu sering.
 */

if (
    shouldSpawnPattern()
) {

    spawnTrafficPattern(canvas);

} else {

    spawnSingleTraffic(canvas);

}

}

/* =========================================================
SPAWN INTERVAL
========================================================= */

function getTrafficSpawnInterval() {

const difficulty =
    trafficState.difficulty;

/*
 * Semakin sulit → interval semakin pendek.
 */

const easy =
    GAME_CONFIG.TRAFFIC.spawnIntervalEasy;

const hard =
    GAME_CONFIG.TRAFFIC.spawnIntervalHard;

const interval =
    easy -
    (
        easy -
        hard
    ) *
    Math.min(
        difficulty / 4,
        1
    );

return Math.max(

    hard,

    Math.floor(interval)

);

}

/* =========================================================
SHOULD SPAWN PATTERN
========================================================= */

function shouldSpawnPattern() {

if (
    trafficState.patternCooldown >
    0
) {

    return false;

}

/*
 * Pattern mulai muncul setelah game
 * cukup lama.
 */

if (
    trafficState.difficulty <
    0.7
) {

    return false;

}

const chance =
    0.12 +
    trafficState.difficulty *
    0.04;

if (
    Math.random() <
    chance
) {

    trafficState.patternCooldown =
        GAME_CONFIG.TRAFFIC.patternCooldown;

    return true;

}

return false;

}

/* =========================================================
SPAWN SINGLE VEHICLE
========================================================= */

function spawnSingleTraffic(canvas) {

const lane =
    chooseSafeLane();

if (lane === -1) {

    return;

}

const type =
    chooseTrafficType();

createTrafficVehicle(
    lane,
    type,
    -120
);

}

/* =========================================================
CHOOSE SAFE LANE
========================================================= */

function chooseSafeLane() {

const laneCount =
    GAME_CONFIG.ROAD.laneCount;

const candidates = [];

for (
    let lane = 0;
    lane < laneCount;
    lane++
) {

    if (
        isLaneBlockedNearTop(lane)
    ) {

        continue;

    }

    candidates.push(lane);

}

/*
 * Kalau semua lane terisi,
 * jangan spawn kendaraan baru.
 *
 * Ini penting agar game tidak menghasilkan
 * situasi mustahil.
 */

if (
    candidates.length === 0
) {

    return -1;

}

/*
 * Kurangi kemungkinan spawn lane yang sama
 * berkali-kali.
 */

const filtered =
    candidates.filter(

        lane =>
            lane !==
            trafficState.lastSpawnLane

    );

const available =
    filtered.length > 0
        ? filtered
        : candidates;

const index =
    Math.floor(
        Math.random() *
        available.length
    );

const selected =
    available[index];

trafficState.lastSpawnLane =
    selected;

return selected;

}

/* =========================================================
CHECK LANE BLOCK
========================================================= */

function isLaneBlockedNearTop(lane) {

if (
    typeof entities === "undefined"
) {

    return false;

}

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
        vehicle.y < 180 &&
        vehicle.y > -160
    ) {

        return true;

    }

}

return false;

}

/* =========================================================
CHOOSE TRAFFIC TYPE
========================================================= */

function chooseTrafficType() {

const entries =
    Object.entries(
        TRAFFIC_TYPES
    );

let totalWeight = 0;

for (
    const [, type]
    of entries
) {

    totalWeight +=
        type.weight;

}

let random =
    Math.random() *
    totalWeight;

for (
    const [name, type]
    of entries
) {

    random -=
        type.weight;

    if (
        random <= 0
    ) {

        return name;

    }

}

return "sedan";

}

/* =========================================================
CREATE TRAFFIC VEHICLE
========================================================= */

function createTrafficVehicle(
lane,
typeName,
y
) {

if (
    typeof entities === "undefined"
) {

    return;

}

const type =
    TRAFFIC_TYPES[typeName];

if (!type) {

    return;

}

const vehicle = {

    id:
        `traffic_${Date.now()}_${Math.random()}`,

    lane:
        lane,

    type:
        typeName,

    x:
    getLaneX(lane),

    y:
        y,

    width:
        type.width,

    height:
        type.height,

    color:
        type.color,

    speedMultiplier:
        type.speedMultiplier,

    scoreValue:
        type.scoreValue,

    passed:
        false,

    nearMissChecked:
        false,

    wobble:
        Math.random() *
        Math.PI *
        2,

    wobbleSpeed:
        0.01 +
        Math.random() *
        0.02,

    rotation:
        0,

    targetRotation:
        0,

    flash:
        0

};

entities.traffic.push(
    vehicle
);

trafficState.totalSpawned++;

if (
    typeof playTrafficSpawnSound ===
    "function"
) {

    playTrafficSpawnSound();

}

}

/* =========================================================
SPAWN TRAFFIC PATTERN
Pattern pertama:

X . X

Artinya lane kiri + kanan terisi,
lane tengah aman.

Pattern kedua:

X X .

atau

. X X

Tujuannya memberi pemain pilihan.
========================================================= */

function spawnTrafficPattern(canvas) {

const patterns = [

    [0, 2],

    [0, 1],

    [1, 2]

];

const pattern =
    patterns[
        Math.floor(
            Math.random() *
            patterns.length
        )
    ];

/*
 * Hindari pattern yang langsung
 * mengunci lane player.
 */

const playerLane =
    gameState.player.targetLane;

let finalPattern =
    pattern;

if (
    finalPattern.includes(
        playerLane
    )
) {

    const safePatterns =
        patterns.filter(

            p =>
                !p.includes(
                    playerLane
                )

        );

    if (
        safePatterns.length > 0
    ) {

        finalPattern =
            safePatterns[
                Math.floor(
                    Math.random() *
                    safePatterns.length
                )
            ];

    }

}

for (
    let i = 0;
    i < finalPattern.length;
    i++
) {

    const lane =
        finalPattern[i];

    const type =
        chooseTrafficType();

    createTrafficVehicle(

        lane,

        type,

        -120 -
        i * 95

    );

}

/*
 * Pattern berikutnya tidak langsung muncul.
 */

trafficState.patternCooldown =
    GAME_CONFIG.TRAFFIC.patternCooldown;

}

/* =========================================================
UPDATE VEHICLES
========================================================= */

function updateTrafficVehicles(canvas) {

if (
    typeof entities === "undefined"
) {

    return;

}

const baseSpeed =
    getWorldSpeed();

for (
    let i = entities.traffic.length - 1;
    i >= 0;
    i--
) {

    const vehicle =
        entities.traffic[i];

    /*
     * Vehicle movement.
     */

    vehicle.y +=
        baseSpeed *
        vehicle.speedMultiplier;

    /*
     * Small visual movement.
     */

    vehicle.wobble +=
        vehicle.wobbleSpeed;

    vehicle.rotation =
        Math.sin(
            vehicle.wobble
        ) *
        0.012;

    /*
     * Check collision.
     */

    checkTrafficCollision(
        vehicle
    );

    /*
     * Check near miss.
     */

    checkNearMiss(
        vehicle
    );

    /*
     * Passed player.
     */

    if (
        !vehicle.passed &&
        vehicle.y >
        gameState.player.y +
        gameState.player.height
    ) {

        vehicle.passed = true;

        trafficState.totalPassed++;

        onVehiclePassed(
            vehicle
        );

    }

}

}

/* =========================================================
GET WORLD SPEED
========================================================= */

function getWorldSpeed() {

let speed =
    gameState.speed;

if (
    gameState.turboActive
) {

    speed *=
        GAME_CONFIG.POWERUPS.turboMultiplier;

}

return speed;

}

/* =========================================================
COLLISION
========================================================= */

function checkTrafficCollision(
vehicle
) {

if (
    typeof playerIntersectsRect !==
    "function"
) {

    return;

}

const rect = {

    x:
        vehicle.x -
        vehicle.width / 2,

    y:
        vehicle.y,

    width:
        vehicle.width,

    height:
        vehicle.height

};

if (
    playerIntersectsRect(
        rect
    )
) {

    /*
     * Remove vehicle immediately
     * so collision isn't repeatedly triggered.
     */

    removeTrafficVehicle(
        vehicle
    );

    damagePlayer();

}

}

/* =========================================================
NEAR MISS
Ini salah satu sistem penting untuk membuat
game terasa rewarding.

Kalau pemain melewati kendaraan dengan jarak
sangat dekat tetapi tidak tabrakan,
pemain mendapat bonus.
========================================================= */

function checkNearMiss(
vehicle
) {

if (
    vehicle.nearMissChecked
) {

    return;

}

/*
 * Near miss hanya dicek saat kendaraan
 * sudah cukup dekat dengan player.
 */

const playerY =
    gameState.player.y;

const verticalDistance =
    Math.abs(
        (
            vehicle.y +
            vehicle.height / 2
        ) -
        (
            playerY +
            gameState.player.height / 2
        )
    );

if (
    verticalDistance >
    55
) {

    return;

}

vehicle.nearMissChecked =
    true;

const playerX =
    gameState.player.x;

const vehicleX =
    vehicle.x;

const horizontalDistance =
    Math.abs(
        playerX -
        vehicleX
    );

const safeDistance =
    (
        vehicle.width +
        gameState.player.width
    ) *
    0.58;

/*
 * Terlalu dekat = near miss.
 */

if (
    horizontalDistance <
    safeDistance &&
    !playerIntersectsRect({

        x:
            vehicle.x -
            vehicle.width / 2,

        y:
            vehicle.y,

        width:
            vehicle.width,

        height:
            vehicle.height

    })
) {

    registerNearMiss(
        vehicle
    );

}

}

/* =========================================================
REGISTER NEAR MISS
========================================================= */

function registerNearMiss(
vehicle
) {

trafficState.nearMisses++;

const bonus =
    50 +
    Math.floor(
        trafficState.difficulty *
        15
    );

gameState.score +=
    bonus;

/*
 * Combo system kalau tersedia.
 */

if (
    typeof registerNearMissCombo ===
    "function"
) {

    registerNearMissCombo();

}

/*
 * Visual feedback.
 */

if (
    typeof createNearMissEffect ===
    "function"
) {

    createNearMissEffect(
        vehicle.x,
        gameState.player.y
    );

}

/*
 * Audio feedback.
 */

if (
    typeof playNearMissSound ===
    "function"
) {

    playNearMissSound();

}

}

/* =========================================================
VEHICLE PASSED
========================================================= */

function onVehiclePassed(
vehicle
) {

/*
 * Base score.
 *
 * Score utama tetap berasal dari waktu/survival,
 * bukan hanya jumlah mobil.
 */

gameState.score +=
    vehicle.scoreValue *
    0.15;

if (
    typeof registerTrafficPass ===
    "function"
) {

    registerTrafficPass(
        vehicle
    );

}

}

/* =========================================================
REMOVE VEHICLE
========================================================= */

function removeTrafficVehicle(
vehicle
) {

if (
    typeof entities === "undefined"
) {

    return;

}

const index =
    entities.traffic.indexOf(
        vehicle
    );

if (
    index !== -1
) {

    entities.traffic.splice(
        index,
        1
    );

}

}

/* =========================================================
CLEANUP
========================================================= */

function cleanupTraffic(canvas) {

if (
    typeof entities === "undefined"
) {

    return;

}

for (
    let i =
        entities.traffic.length - 1;

    i >= 0;

    i--
) {

    const vehicle =
        entities.traffic[i];

    /*
     * Beri sedikit ruang di bawah canvas
     * sebelum dihapus.
     */

    if (
        vehicle.y >
        canvas.height +
        140
    ) {

        entities.traffic.splice(
            i,
            1
        );

    }

}

}

/* =========================================================
GET TRAFFIC COUNT
========================================================= */

function getTrafficCount() {

if (
    typeof entities === "undefined"
) {

    return 0;

}

return entities.traffic.length;

}

/* =========================================================
GET TRAFFIC DIFFICULTY
========================================================= */

function getTrafficDifficulty() {

return trafficState.difficulty;

}

/* =========================================================
GET TRAFFIC DEBUG INFO
========================================================= */

function getTrafficDebugInfo() {

return {

    activeVehicles:
        getTrafficCount(),

    spawned:
        trafficState.totalSpawned,

    passed:
        trafficState.totalPassed,

    nearMisses:
        trafficState.nearMisses,

    difficulty:
        Number(
            trafficState.difficulty.toFixed(2)
        ),

    spawnTimer:
        trafficState.spawnTimer

};

}

/* =========================================================
RESIZE
========================================================= */

function resizeTraffic(canvas) {

/*
 * Traffic menggunakan lane system,
 * jadi X akan dihitung ulang ketika renderer
 * menggambar kendaraan.

 * Tidak perlu memindahkan Y.
 */

}

/* =========================================================
CLEAR TRAFFIC
========================================================= */

function clearTraffic() {

if (
    typeof entities === "undefined"
) {

    return;

}

entities.traffic.length = 0;

}

/* =========================================================
FORCE SPAWN
Utility untuk testing / debug.
========================================================= */

function forceSpawnTraffic(
lane = -1,
type = "sedan"
) {

if (
    lane < 0
) {

    lane =
        chooseSafeLane();

}

if (
    lane === -1
) {

    return;

}

createTrafficVehicle(

    lane,

    type,

    -120

);

}
