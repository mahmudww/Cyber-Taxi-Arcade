/* ========================================
   CYBER TAXI — ENTITIES
   ======================================== */

const player = {
    width: 44,
    height: 84,

    y: 0,

    shields: 0,

    lane: 1,

    // Visual movement
    visualLane: 1,
    moveFromLane: 1,
    moveToLane: 1,
    laneProgress: 0,

    isMoving: false,
    tilt: 0
};


/* ========================================
   ENEMIES
   ======================================== */

const obstacles = [];


/* ========================================
   POWER-UPS
   ======================================== */

const powerups = [];


/* ========================================
   PARTICLES
   ======================================== */

const particles = [];


/* ========================================
   PLAYER MOVEMENT
   ======================================== */

function movePlayer(direction) {

    const newLane =
        player.lane + direction;

    // Only allow lanes 0, 1, 2
    if (newLane < 0 || newLane > 2) {
        return false;
    }

    // Don't start another movement
    // while already moving.
    if (player.isMoving) {
        return false;
    }

    player.moveFromLane = player.lane;
    player.moveToLane = newLane;

    player.lane = newLane;

    player.laneProgress = 0;
    player.isMoving = true;

    return true;
}


/* ========================================
   SMOOTH PLAYER MOVEMENT
   ======================================== */

function updatePlayerMovement() {

    if (!player.isMoving) {
        player.visualLane = player.lane;
        player.tilt = 0;
        return;
    }

    player.laneProgress += 0.18;

    if (player.laneProgress >= 1) {

        player.laneProgress = 1;

        player.visualLane =
            player.moveToLane;

        player.isMoving = false;

        player.tilt = 0;

        return;
    }

    // Smooth interpolation
    const t = player.laneProgress;

    player.visualLane =
        player.moveFromLane +
        (
            player.moveToLane -
            player.moveFromLane
        ) * t;

    // Small visual tilt while changing lane
    const direction =
        player.moveToLane -
        player.moveFromLane;

    player.tilt =
        direction *
        0.08 *
        Math.sin(t * Math.PI);
}


/* ========================================
   CREATE PARTICLES
   ======================================== */

function createParticles(
    x,
    y,
    color,
    count
) {

    for (let i = 0; i < count; i++) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - 0.5) * 6,

            vy:
                (Math.random() - 0.5) * 6,

            radius:
                Math.random() * 3 + 1,

            color: color,

            alpha: 1

        });

    }
}


/* ========================================
   UPDATE PARTICLES
   ======================================== */

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x +=
            particle.vx;

        particle.y +=
            particle.vy;

        particle.alpha -= 0.05;

        if (
            particle.alpha <= 0
        ) {

            particles.splice(i, 1);

        }

    }
}


/* ========================================
   RESET ENTITIES
   ======================================== */

function resetEntities() {

    obstacles.length = 0;

    powerups.length = 0;

    particles.length = 0;

    player.lane = 1;

    player.visualLane = 1;

    player.moveFromLane = 1;

    player.moveToLane = 1;

    player.laneProgress = 0;

    player.isMoving = false;

    player.tilt = 0;

    player.shields = 0;

    player.y = 0;
}


/* ========================================
   EXPORTS
   ======================================== */

export {

    player,

    obstacles,

    powerups,

    particles,

    movePlayer,

    updatePlayerMovement,

    createParticles,

    updateParticles,

    resetEntities

};
