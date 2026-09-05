/* ========================================
   CYBER TAXI — ENTITIES
   ========================================

   Player
   Enemies
   Power-ups
   Particles
   Smooth movement
   ======================================== */


/* ========================================
   PLAYER
   ======================================== */

const player = {

    width: 44,

    height: 84,

    y: 0,

    shields: 0,

    /* Actual lane */
    lane: 1,

    /* Visual movement */

    visualLane: 1,

    moveFromLane: 1,

    moveToLane: 1,

    laneProgress: 1,

    isMoving: false,

    /* Car leaning while turning */

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

    /* Don't move while already transitioning */

    if (player.isMoving) {
        return false;
    }


    const newLane =
        player.lane + direction;


    /* Stay inside 3 lanes */

    if (
        newLane < 0 ||
        newLane > 2
    ) {

        return false;

    }


    /* Remember starting lane */

    player.moveFromLane =
        player.lane;


    /* New target lane */

    player.moveToLane =
        newLane;


    /* Actual gameplay lane changes immediately */

    player.lane =
        newLane;


    /* Start visual animation */

    player.laneProgress =
        0;


    player.isMoving =
        true;


    /* Turn direction */

    player.tilt =
        direction > 0
            ? 0.10
            : -0.10;


    return true;

}


/* ========================================
   UPDATE PLAYER MOVEMENT
   ======================================== */

function updatePlayerMovement() {

    if (!player.isMoving) {

        /* Slowly return car to straight */

        player.tilt *= 0.82;

        if (
            Math.abs(player.tilt) < 0.001
        ) {

            player.tilt = 0;

        }

        return;

    }


    /*
     * Movement speed.
     *
     * Higher number =
     * faster lane transition.
     */

    player.laneProgress += 0.16;


    if (
        player.laneProgress >= 1
    ) {

        player.laneProgress = 1;

        player.visualLane =
            player.moveToLane;

        player.isMoving =
            false;

        player.tilt = 0;

        return;

    }


    /*
     * Smooth easing.
     *
     * Starts quickly,
     * slows down near target.
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


    player.visualLane =
        player.moveFromLane +
        (
            player.moveToLane -
            player.moveFromLane
        ) * eased;


    /*
     * Slight lean while moving.
     */

    const direction =
        player.moveToLane >
        player.moveFromLane
            ? 1
            : -1;


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
                (Math.random() - 0.5) *
                6,

            vy:
                (Math.random() - 0.5) *
                6,

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

    obstacles.length = 0;

    powerups.length = 0;

    particles.length = 0;


    player.lane = 1;

    player.visualLane = 1;

    player.moveFromLane = 1;

    player.moveToLane = 1;

    player.laneProgress = 1;

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
