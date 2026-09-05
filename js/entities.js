/* ========================================
   CYBER TAXI — ENTITIES
   ======================================== */


/* ========================================
   PLAYER
   ======================================== */

const player = {

    width: 44,
    height: 84,

    y: 0,

    shields: 0,

    // Gameplay lane
    lane: 1,

    // Visual position
    x: 0,

    targetX: 0,

    isMoving: false,

    // Visual tilt
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


    // Stay inside the 3 lanes
    if (
        newLane < 0 ||
        newLane > 2
    ) {
        return false;
    }


    // Update gameplay lane immediately
    player.lane = newLane;


    // game.js will set targetX
    // during the next update.
    player.isMoving = true;


    return true;
}


/* ========================================
   UPDATE PLAYER MOVEMENT
   ======================================== */

function updatePlayerMovement() {

    /*
     * targetX is assigned by game.js.
     * If we don't have a valid target yet,
     * don't move.
     */

    if (
        !Number.isFinite(player.targetX)
    ) {
        return;
    }


    /*
     * Smoothly move toward target.
     *
     * This is frame-rate friendly and
     * gives a nice arcade-style slide.
     */

    const difference =
        player.targetX -
        player.x;


    player.x +=
        difference * 0.22;


    /*
     * Snap when we're very close.
     */

    if (
        Math.abs(difference) < 0.5
    ) {

        player.x =
            player.targetX;

        player.isMoving =
            false;

        player.tilt = 0;

    }
    else {

        /*
         * Determine movement direction.
         */

        const direction =
            difference > 0
                ? 1
                : -1;


        /*
         * Small lean while changing lane.
         */

        player.tilt =
            direction * 0.10;

    }

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
   RESET
   ======================================== */

function resetEntities() {

    obstacles.length = 0;

    powerups.length = 0;

    particles.length = 0;


    player.lane = 1;

    player.x = 0;

    player.targetX = 0;

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
