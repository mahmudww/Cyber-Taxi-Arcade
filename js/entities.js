/* ========================================
   CYBER TAXI — ENTITIES
   ========================================

   This file manages:
   - Player
   - Enemies
   - Power-ups
   - Particles
   ======================================== */


/* ========================================
   PLAYER
   ======================================== */

const player = {
    width: 44,
    height: 84,
    y: 0,
    shields: 0,
    lane: 1
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
   CREATE PARTICLES
   ======================================== */

function createParticles(x, y, color, count) {

    for (let i = 0; i < count; i++) {

        particles.push({
            x: x,
            y: y,

            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,

            radius: Math.random() * 3 + 1,

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

        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.alpha -= 0.05;

        if (particle.alpha <= 0) {
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

    createParticles,
    updateParticles,
    resetEntities
};
