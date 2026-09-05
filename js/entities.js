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

    lane: 1,

    visualLane: 1,

    moveFromLane: 1,

    moveToLane: 1,

    laneProgress: 1,

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
   MOVE PLAYER
   ======================================== */

function movePlayer(direction) {

    const newLane =
        player.lane + direction;


    /* Keep player inside 3 lanes */

    if (
        newLane < 0 ||
        newLane > 2
    ) {

        return false;

    }


    player.lane =
        newLane;


    /*
     * For now visual lane follows
     * immediately.
     *
     * We will add smooth movement
     * later after everything is stable.
     */

    player.visualLane =
        newLane;


    player.moveFromLane =
        newLane;


    player.moveToLane =
        newLane;


    player.laneProgress =
        1;


    player.isMoving =
        false;


    player.tilt =
        0;


    return true;

}


/* ========================================
   PLAYER MOVEMENT UPDATE
   ======================================== */

function updatePlayerMovement() {

    /*
     * Movement is currently instant.
     *
     * This function exists because
     * game.js expects it.
     *
     * We will upgrade this later.
     */

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
