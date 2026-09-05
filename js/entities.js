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

    /* Target lane */
    lane: 1,

    /* Visual / movement lane */

    visualLane: 1,

    laneProgress: 0,

    moveFromLane: 1,

    moveToLane: 1,

    isMoving: false,

    moveSpeed: 0.22,

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


    /* Outside road */

    if (
        newLane < 0 ||
        newLane > 2
    ) {

        return false;

    }


    /* Already moving */

    if (player.isMoving) {

        return false;

    }


    player.moveFromLane =
        player.lane;


    player.moveToLane =
        newLane;


    player.lane =
        newLane;


    player.laneProgress =
        0;


    player.isMoving =
        true;


    /* Lean into the turn */

    player.tilt =
        direction * 0.12;


    return true;

}


/* ========================================
   UPDATE PLAYER MOVEMENT
   ======================================== */

function updatePlayerMovement() {

    if (
        !player.isMoving
    ) {

        /* Slowly return car upright */

        player.tilt *= 0.8;

        if (
            Math.abs(player.tilt) < 0.001
        ) {

            player.tilt = 0;

        }

        return;

    }


    player.laneProgress +=
        player.moveSpeed;


    if (
        player.laneProgress >= 1
    ) {

        player.laneProgress = 1;

        player.visualLane =
            player.moveToLane;

        player.isMoving =
            false;

        player.tilt =
            0;

        return;

    }


    /*
     * Smoothstep easing.

     * Instead of moving at constant speed,
     * the taxi accelerates and decelerates.
     */

    const t =
        player.laneProgress;


    const smoothT =
        t * t * (3 - 2 * t);


    player.visualLane =
        player.moveFromLane +
        (
            player.moveToLane -
            player.moveFromLane
        ) *
        smoothT;

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
