/* ========================================
   CYBER TAXI — ENTITIES
   ========================================

   Manages:
   - Player
   - Enemies
   - Power-ups
   - Particles
   - Smooth lane movement
   ======================================== */


/* ========================================
   PLAYER
   ======================================== */

const player = {

    width: 44,
    height: 84,

    y: 0,

    shields: 0,

    // Actual gameplay lane
    lane: 1,

    // Visual lane used for smooth animation
    visualLane: 1,

    moveFromLane: 1,

    moveToLane: 1,

    laneProgress: 0,

    isMoving: false,

    // Small rotation while changing lane
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

    // Calculate requested lane
    const newLane =
        player.lane + direction;


    // Only three lanes exist:
    // 0 = left
    // 1 = center
    // 2 = right
    if (
        newLane < 0 ||
        newLane > 2
    ) {
        return false;
    }


    // Prevent movement from being
    // triggered repeatedly while
    // the current animation is running.
    if (player.isMoving) {
        return false;
    }


    // Remember starting position
    player.moveFromLane =
        player.lane;


    // Remember destination
    player.moveToLane =
        newLane;


    // Update actual gameplay lane
    player.lane =
        newLane;


    // Start animation
    player.laneProgress = 0;

    player.isMoving = true;

    player.tilt = 0;


    return true;
}


/* ========================================
   UPDATE PLAYER MOVEMENT
   ======================================== */

function updatePlayerMovement() {

    /*
     * If the player isn't moving,
     * make sure the visual position
     * matches the actual lane.
     */

    if (!player.isMoving) {

        player.visualLane =
            player.lane;

        player.tilt = 0;

        return;
    }


    /*
     * Increase animation progress.
     *
     * 0 = beginning
     * 1 = finished
     */

    player.laneProgress += 0.12;


    /*
     * Finish movement
     */

    if (
        player.laneProgress >= 1
    ) {

        player.laneProgress = 1;

        player.visualLane =
            player.moveToLane;

        player.isMoving = false;

        player.tilt = 0;

        return;
    }


    /*
     * Smooth ease-in-out.
     *
     * This makes the car:
     *
     * slow → fast → slow
     *
     * instead of moving at a robotic
     * constant speed.
     */

    const t =
        player.laneProgress;


    const eased =
        t < 0.5
            ? 2 * t * t
            : 1 -
              Math.pow(
                  -2 * t + 2,
                  2
              ) / 2;


    /*
     * Calculate visual lane position.
     */

    player.visualLane =
        player.moveFromLane +
        (
            player.moveToLane -
            player.moveFromLane
        ) * eased;


    /*
     * Slight vehicle tilt while
     * changing lanes.
     */

    const direction =
        player.moveToLane -
        player.moveFromLane;


    player.tilt =
        direction *
        0.10 *
        Math.sin(
            t * Math.PI
        );
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

    for (
        let i = 0;
        i < count;
        i++
    ) {

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


        particle.alpha -=
            0.05;


        if (
            particle.alpha <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }
}


/* ========================================
   RESET ENTITIES
   ======================================== */

function resetEntities() {

    /*
     * Clear enemies
     */

    obstacles.length = 0;


    /*
     * Clear power-ups
     */

    powerups.length = 0;


    /*
     * Clear particles
     */

    particles.length = 0;


    /*
     * Reset player lane
     */

    player.lane = 1;

    player.visualLane = 1;

    player.moveFromLane = 1;

    player.moveToLane = 1;

    player.laneProgress = 0;

    player.isMoving = false;

    player.tilt = 0;


    /*
     * Reset shield
     */

    player.shields = 0;


    /*
     * Position will be set by game.js
     */

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
