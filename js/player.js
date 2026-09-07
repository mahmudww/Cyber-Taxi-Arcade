/* =========================================================
CYBER TAXI
PLAYER SYSTEM

Bertanggung jawab terhadap:

posisi taxi
perpindahan lane
smoothing movement
body lean
engine glow
visual trail
player animation

Player tidak mengurus:

input
collision
rendering utama
spawning traffic
========================================================= */

/* =========================================================
PLAYER ANIMATION STATE
========================================================= */

const playerAnimation = {

visualX: 0,

visualY: 0,

velocityX: 0,

lean: 0,

targetLean: 0,

bob: 0,

pulse: 0,

trailTimer: 0,

lastLane: 1,

laneChangeFlash: 0


};

/* =========================================================
INITIALIZE PLAYER
========================================================= */

function initPlayer(canvas) {

updatePlayerDimensions(canvas);

const lanes =
    getLanePositions(canvas.width);


const startingLane =
    GAME_CONFIG.PLAYER.startingLane;


gameState.player.lane =
    startingLane;

gameState.player.targetLane =
    startingLane;


gameState.player.x =
    lanes[startingLane];

gameState.player.targetX =
    lanes[startingLane];


gameState.player.y =
    getPlayerY(canvas.height);


playerAnimation.visualX =
    gameState.player.x;

playerAnimation.visualY =
    gameState.player.y;

playerAnimation.velocityX = 0;

playerAnimation.lean = 0;

playerAnimation.targetLean = 0;

playerAnimation.bob = 0;

playerAnimation.pulse = 0;

playerAnimation.trailTimer = 0;

playerAnimation.lastLane =
    startingLane;

playerAnimation.laneChangeFlash = 0;


}

/* =========================================================
UPDATE PLAYER DIMENSIONS
========================================================= */

function updatePlayerDimensions(canvas) {

    /*
     * Fallback ke canvas utama.
     */

    if (!canvas) {
        canvas = document.getElementById("gameCanvas");
    }

    /*
     * Safety check.
     */

    if (!canvas) {
        console.error(
            "[Cyber Taxi] Cannot update player dimensions: canvas not found."
        );
        return;
    }


    gameState.player.width =
        GAME_CONFIG.ROAD.playerWidth;

    gameState.player.height =
        GAME_CONFIG.ROAD.playerHeight;

    gameState.player.y =
        getPlayerY(canvas.height);

}

/* =========================================================
PLAYER UPDATE
========================================================= */

function updatePlayer(canvas) {

if (!gameState.isPlaying) {

    return;

}


if (gameState.isPaused) {

    return;

}


updatePlayerTarget(canvas);

updatePlayerMovement();

updatePlayerAnimation();

updatePlayerTrail();

updatePlayerInvulnerability();


}

/* =========================================================
TARGET POSITION
========================================================= */

function updatePlayerTarget(canvas) {

const lanes =
    getLanePositions(canvas.width);


const targetLane =
    clamp(

        gameState.player.targetLane,

        0,

        GAME_CONFIG.ROAD.laneCount - 1

    );


gameState.player.targetX =
    lanes[targetLane];


gameState.player.y =
    getPlayerY(canvas.height);


}

/* =========================================================
SMOOTH MOVEMENT

Taxi tidak langsung teleport ke lane baru.

Kita menggunakan interpolation dengan sedikit
acceleration/deceleration agar terasa arcade-like.
========================================================= */

function updatePlayerMovement() {

const currentX =
    playerAnimation.visualX;


const targetX =
    gameState.player.targetX;


const distance =
    targetX - currentX;


/*
 * Velocity-based movement.
 */

playerAnimation.velocityX +=
    distance *
    GAME_CONFIG.PLAYER.laneAcceleration;


playerAnimation.velocityX *=
    GAME_CONFIG.PLAYER.laneFriction;


/*
 * Batasi kecepatan perpindahan lane.
 */

playerAnimation.velocityX =
    clamp(

        playerAnimation.velocityX,

        -GAME_CONFIG.PLAYER.maxLaneSpeed,

        GAME_CONFIG.PLAYER.maxLaneSpeed

    );


playerAnimation.visualX +=
    playerAnimation.velocityX;


/*
 * Snap ketika sudah sangat dekat
 * supaya tidak terjadi floating kecil.
 */

if (
    Math.abs(distance) <
    0.5 &&
    Math.abs(playerAnimation.velocityX) <
    0.5
) {

    playerAnimation.visualX =
        targetX;

    playerAnimation.velocityX = 0;

}


gameState.player.x =
    playerAnimation.visualX;


/*
 * Tentukan arah pergerakan untuk visual lean.
 */

if (
    playerAnimation.velocityX >
    0.2
) {

    playerAnimation.targetLean =
        GAME_CONFIG.PLAYER.maxLean;

} else if (
    playerAnimation.velocityX <
    -0.2
) {

    playerAnimation.targetLean =
        -GAME_CONFIG.PLAYER.maxLean;

} else {

    playerAnimation.targetLean = 0;

}


/*
 * Smooth lean.
 */

playerAnimation.lean +=
    (
        playerAnimation.targetLean -
        playerAnimation.lean
    ) *
    GAME_CONFIG.PLAYER.leanSmoothing;


}

/* =========================================================
PLAYER ANIMATION
========================================================= */

function updatePlayerAnimation() {

playerAnimation.bob +=
    GAME_CONFIG.PLAYER.bobSpeed;


playerAnimation.pulse +=
    GAME_CONFIG.PLAYER.pulseSpeed;


/*
 * Sedikit vertical bob.
 */

const bobAmount =
    Math.sin(
        playerAnimation.bob
    ) *
    GAME_CONFIG.PLAYER.bobAmount;


playerAnimation.visualY =
    gameState.player.y +
    bobAmount;


/*
 * Lane change flash.
 */

if (
    playerAnimation.laneChangeFlash >
    0
) {

    playerAnimation.laneChangeFlash--;

}


}

/* =========================================================
PLAYER TRAIL
========================================================= */

function updatePlayerTrail() {

playerAnimation.trailTimer--;


if (
    playerAnimation.trailTimer > 0
) {

    return;

}


playerAnimation.trailTimer =
    GAME_CONFIG.PLAYER.trailInterval;


/*
 * Saat turbo, trail lebih sering muncul.
 */

if (
    gameState.turboActive
) {

    playerAnimation.trailTimer =
        Math.max(
            1,
            GAME_CONFIG.PLAYER.trailInterval / 2
        );

}


if (
    typeof createPlayerTrailParticle ===
    "function"
) {

    createPlayerTrailParticle();

}


}

/* =========================================================
INVULNERABILITY
========================================================= */

function updatePlayerInvulnerability() {

if (
    !gameState.player.isInvulnerable
) {

    return;

}


if (
    gameState.player.invulnerabilityTimer >
    0
) {

    gameState.player.invulnerabilityTimer--;

}


if (
    gameState.player.invulnerabilityTimer <=
    0
) {

    gameState.player.isInvulnerable =
        false;

}


}

/* =========================================================
LANE CHANGE EFFECT
========================================================= */

function onPlayerLaneChanged() {

playerAnimation.laneChangeFlash = 6;


if (
    typeof createLaneChangeEffect ===
    "function"
) {

    createLaneChangeEffect(

        gameState.player.x,

        gameState.player.y

    );

}


}

/* =========================================================
GET PLAYER DRAW POSITION
========================================================= */

function getPlayerDrawPosition() {

return {

    x: playerAnimation.visualX,

    y: playerAnimation.visualY,

    lean: playerAnimation.lean

};


}

/* =========================================================
PLAYER BOUNDS
========================================================= */

function getPlayerBounds() {

const width =
    gameState.player.width;

const height =
    gameState.player.height;


/*
 * Collision box sedikit lebih kecil
 * daripada sprite.

 * Ini penting untuk game arcade:
 * visual boleh bersentuhan sedikit,
 * tetapi collision tidak terasa curang.
 */

const collisionWidth =
    width *
    GAME_CONFIG.PLAYER.collisionWidth;

const collisionHeight =
    height *
    GAME_CONFIG.PLAYER.collisionHeight;


return {

    x:
        gameState.player.x -
        collisionWidth / 2,

    y:
        gameState.player.y +
        (
            height -
            collisionHeight
        ) / 2,

    width:
        collisionWidth,

    height:
        collisionHeight

};


}

/* =========================================================
CHECK PLAYER INVULNERABILITY
========================================================= */

function isPlayerInvulnerable() {

return (
    gameState.player.isInvulnerable
);


}

/* =========================================================
DAMAGE PLAYER
========================================================= */

function damagePlayer() {

if (!gameState.isPlaying) {

    return false;

}


if (
    isPlayerInvulnerable()
) {

    return false;

}


/*
 * Shield menyerap satu tabrakan.
 */

if (
    gameState.player.shields > 0
) {

    removeShield();


    activateInvulnerability(
        GAME_CONFIG.PLAYER.damageInvulnerability
    );


    triggerScreenShake(
        GAME_CONFIG.EFFECTS.shieldShakeDuration,
        GAME_CONFIG.EFFECTS.shieldShakeIntensity
    );


    triggerFlash(
        "#00ffcc",
        6
    );


    playShieldBreakSound();


    if (
        typeof createShieldBreakEffect ===
        "function"
    ) {

        createShieldBreakEffect(

            gameState.player.x,

            gameState.player.y

        );

    }


    return true;

}


/*
 * Tidak punya shield = game over.
 */

triggerScreenShake(
    GAME_CONFIG.EFFECTS.crashShakeDuration,
    GAME_CONFIG.EFFECTS.crashShakeIntensity
);


triggerFlash(
    "#ff0066",
    10
);


playGameOverSound();


if (
    typeof createCrashEffect ===
    "function"
) {

    createCrashEffect(

        gameState.player.x,

        gameState.player.y

    );

}


endGameState();


return true;


}

/* =========================================================
PLAYER HIT TEST
========================================================= */

function playerIntersectsRect(rect) {

const playerBounds =
    getPlayerBounds();


return (

    playerBounds.x <
        rect.x + rect.width &&

    playerBounds.x +
    playerBounds.width >
        rect.x &&

    playerBounds.y <
        rect.y + rect.height &&

    playerBounds.y +
    playerBounds.height >
        rect.y

);


}

/* =========================================================
PLAYER LANE
========================================================= */

function getPlayerLane() {

return gameState.player.targetLane;


}

/* =========================================================
PLAYER SPEED FACTOR
========================================================= */

function getPlayerSpeedFactor() {

if (
    gameState.turboActive
) {

    return 1.8;

}


return 1;


}

/* =========================================================
PLAYER TURBO STATE
========================================================= */

function isTurboActive() {

return gameState.turboActive;


}

/* =========================================================
PLAYER RESET
========================================================= */

function resetPlayer(canvas) {

    /*
     * Jika canvas tidak diberikan oleh game.js,
     * ambil canvas utama secara otomatis.
     */

    if (!canvas) {
        canvas = document.getElementById("gameCanvas");
    }

    /*
     * Safety check.
     */

    if (!canvas) {
        console.error(
            "[Cyber Taxi] Cannot reset player: game canvas not found."
        );
        return;
    }

    initPlayer(canvas);

}

/* =========================================================
PLAYER DEBUG INFO
========================================================= */

function getPlayerDebugInfo() {

return {

    lane:
        gameState.player.lane,

    targetLane:
        gameState.player.targetLane,

    x:
        Math.round(
            gameState.player.x
        ),

    targetX:
        Math.round(
            gameState.player.targetX
        ),

    velocityX:
        Number(
            playerAnimation.velocityX.toFixed(2)
        ),

    lean:
        Number(
            playerAnimation.lean.toFixed(3)
        ),

    shields:
        gameState.player.shields,

    turbo:
        gameState.turboActive

};


}

/* =========================================================
PLAYER TRAIL PARTICLE

Fungsi ini sengaja punya fallback.

Kalau effects.js belum tersedia,
player tetap bisa berjalan.
========================================================= */

function createPlayerTrailParticle() {

if (
    typeof entities ===
    "undefined"
) {

    return;

}


const x =
    gameState.player.x;


const y =
    gameState.player.y +
    gameState.player.height -
    4;


const turbo =
    gameState.turboActive;


entities.particles.push({

    x:
        x +
        (Math.random() - 0.5) *
        14,

    y:
        y,

    vx:
        (Math.random() - 0.5) *
        0.8,

    vy:
        turbo
            ? 2.5
            : 1.4,

    radius:
        turbo
            ? Math.random() * 3 + 1
            : Math.random() * 2 + 1,

    color:
        turbo
            ? "#ffb86c"
            : "#00ffcc",

    alpha: 0.55,

    life:
        turbo
            ? 22
            : 15

});


}

/* =========================================================
PLAYER RESIZE
========================================================= */

function resizePlayer(canvas) {

updatePlayerDimensions(canvas);


const lanes =
    getLanePositions(canvas.width);


const lane =
    clamp(

        gameState.player.targetLane,

        0,

        lanes.length - 1

    );


gameState.player.targetX =
    lanes[lane];


/*
 * Jangan langsung teleport visual position
 * kecuali player belum initialized.
 */

if (
    !gameState.isPlaying
) {

    playerAnimation.visualX =
        gameState.player.targetX;

}


}

/* =========================================================
PLAYER UPDATE AFTER RESIZE
========================================================= */

function handlePlayerResize(canvas) {

resizePlayer(canvas);


}
