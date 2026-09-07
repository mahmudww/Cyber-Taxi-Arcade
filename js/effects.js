/* =========================================================
CYBER TAXI
VISUAL EFFECTS SYSTEM
Mengatur semua "game juice":

particles
sparks
explosions
pickup effects
shield impact
turbo trail
near miss
screen flash
screen shake
floating text
speed lines
neon glow
Prinsip:

PLAYER melakukan sesuatu
↓
GAME memberikan feedback
↓
feedback terasa cepat
↓
pemain merasa "gue berhasil"

========================================================= */

/* =========================================================
EFFECT STATE
========================================================= */

const effectState = {

screenShake: 0,

screenShakePower: 0,

screenFlash: 0,

screenFlashColor:
    "#ffffff",

screenFlashAlpha: 0,

speedLines: [],

floatingTexts: [],

particles: [],

rings: [],

sparks: [],

turboTrailTimer: 0

};

/* =========================================================
PARTICLE FACTORY
========================================================= */

function createParticle(
x,
y,
options = {}
) {

const particle = {

    x:
        x,

    y:
        y,

    vx:
        options.vx ??
        (Math.random() - 0.5) * 4,

    vy:
        options.vy ??
        (Math.random() - 0.5) * 4,

    size:
        options.size ??
        Math.random() * 3 + 1,

    color:
        options.color ??
        "#00ffcc",

    alpha:
        options.alpha ??
        1,

    life:
        options.life ??
        30,

    maxLife:
        options.life ??
        30,

    gravity:
        options.gravity ??
        0,

    friction:
        options.friction ??
        0.98,

    glow:
        options.glow ??
        true

};


effectState.particles.push(
    particle
);

}

/* =========================================================
PARTICLE BURST
========================================================= */

function createParticleBurst(
x,
y,
color = "#00ffcc",
count = 12,
power = 4
) {

for (
    let i = 0;
    i < count;
    i++
) {

    const angle =
        Math.random() *
        Math.PI *
        2;


    const speed =
        Math.random() *
        power;


    createParticle(

        x,

        y,

        {

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            size:
                Math.random() *
                3 +
                1,

            color:
                color,

            life:
                20 +
                Math.random() *
                25,

            glow:
                true

        }

    );

}

}

/* =========================================================
PICKUP PARTICLES
========================================================= */

function createPickupParticles(
x,
y,
color = "#00ffcc"
) {

createParticleBurst(
    x,
    y,
    color,
    22,
    5
);


createRingEffect(
    x,
    y,
    color,
    8,
    42
);


createFloatingText(
    x,
    y - 20,
    "+ PICKUP",
    color
);

}

/* =========================================================
SHIELD ACTIVATION
========================================================= */

function createShieldActivateEffect(
x,
y
) {

createParticleBurst(
    x,
    y,
    "#00ffcc",
    28,
    5
);


createRingEffect(
    x,
    y,
    "#00ffcc",
    5,
    70
);


createFloatingText(
    x,
    y - 30,
    "SHIELD!",
    "#00ffcc"
);


triggerScreenFlash(
    "#00ffcc",
    4
);

}

/* =========================================================
SHIELD IMPACT
========================================================= */

function createShieldImpactEffect(
x,
y
) {

createParticleBurst(
    x,
    y,
    "#00ffcc",
    35,
    7
);


createRingEffect(
    x,
    y,
    "#00ffcc",
    2,
    90
);


createFloatingText(
    x,
    y - 30,
    "BLOCKED!",
    "#00ffcc"
);


triggerScreenShake(
    8,
    6
);


triggerScreenFlash(
    "#00ffcc",
    5
);

}

/* =========================================================
TURBO ACTIVATION
========================================================= */

function createTurboActivateEffect(
x,
y
) {

createParticleBurst(
    x,
    y + 35,
    "#ffb86c",
    35,
    7
);


createRingEffect(
    x,
    y,
    "#ffb86c",
    4,
    80
);


createFloatingText(
    x,
    y - 30,
    "TURBO!",
    "#ffb86c"
);


triggerScreenShake(
    5,
    4
);


triggerScreenFlash(
    "#ffb86c",
    4
);

}

/* =========================================================
TURBO END
========================================================= */

function createTurboEndEffect(
x,
y
) {

createParticleBurst(
    x,
    y,
    "#ffb86c",
    14,
    3
);


createFloatingText(
    x,
    y - 25,
    "TURBO END",
    "#ffb86c"
);

}

/* =========================================================
TURBO TRAIL
========================================================= */

function createTurboTrail(
x,
y
) {

effectState.turboTrailTimer++;


/*
 * Tidak membuat particle setiap frame.
 * Ini menjaga performa mobile.
 */

if (
    effectState.turboTrailTimer %
    2 !==
    0
) {

    return;

}


createParticle(

    x +
    (
        Math.random() -
        0.5
    ) *
    14,

    y + 38,

    {

        vx:
            (
                Math.random() -
                0.5
            ) *
            1.5,

        vy:
            2 +
            Math.random() *
            3,

        size:
            2 +
            Math.random() *
            3,

        color:
            Math.random() >
            0.5
                ? "#ffb86c"
                : "#ff007f",

        life:
            12 +
            Math.random() *
            12,

        glow:
            true

    }

);

}

/* =========================================================
NEAR MISS
========================================================= */

function createNearMissEffect(
x,
y
) {

createParticleBurst(
    x,
    y,
    "#ffffff",
    18,
    4
);


createRingEffect(
    x,
    y,
    "#ffffff",
    3,
    55
);


createFloatingText(
    x,
    y - 25,
    "NEAR MISS!",
    "#ffffff"
);


triggerScreenShake(
    4,
    2
);


triggerScreenFlash(
    "#ffffff",
    2
);

}

/* =========================================================
CRASH EFFECT
========================================================= */

function createCrashEffect(
x,
y
) {

createParticleBurst(
    x,
    y,
    "#ff007f",
    45,
    9
);


createParticleBurst(
    x,
    y,
    "#ff3333",
    25,
    7
);


createRingEffect(
    x,
    y,
    "#ff3333",
    2,
    100
);


triggerScreenShake(
    18,
    12
);


triggerScreenFlash(
    "#ff3333",
    8
);

}

/* =========================================================
GENERIC RING
========================================================= */

function createRingEffect(
x,
y,
color,
width = 4,
maxRadius = 60
) {

effectState.rings.push({

    x:
        x,

    y:
        y,

    radius:
        5,

    maxRadius:
        maxRadius,

    color:
        color,

    width:
        width,

    alpha:
        1,

    speed:
        3

});

}

/* =========================================================
FLOATING TEXT
========================================================= */

function createFloatingText(
x,
y,
text,
color = "#ffffff"
) {

effectState.floatingTexts.push({

    x:
        x,

    y:
        y,

    text:
        text,

    color:
        color,

    alpha:
        1,

    life:
        50,

    maxLife:
        50,

    vy:
        -0.7

});

}

/* =========================================================
SCREEN SHAKE
========================================================= */

function triggerScreenShake(
power = 5,
duration = 5
) {

/*
 * Kalau ada shake yang lebih kuat,
 * jangan ditimpa shake kecil.
 */

effectState.screenShake =
    Math.max(
        effectState.screenShake,
        duration
    );


effectState.screenShakePower =
    Math.max(
        effectState.screenShakePower,
        power
    );

}

/* =========================================================
GET SCREEN SHAKE
========================================================= */

function getScreenShakeOffset() {

if (
    effectState.screenShake <=
    0
) {

    return {

        x: 0,

        y: 0

    };

}


const strength =
    effectState.screenShakePower;


const x =
    (
        Math.random() -
        0.5
    ) *
    strength;


const y =
    (
        Math.random() -
        0.5
    ) *
    strength;


return {

    x:
        x,

    y:
        y

};

}

/* =========================================================
SCREEN FLASH
========================================================= */

function triggerScreenFlash(
color = "#ffffff",
intensity = 5
) {

effectState.screenFlash =
    intensity;


effectState.screenFlashColor =
    color;


effectState.screenFlashAlpha =
    Math.min(
        0.55,
        intensity /
        20
    );

}

/* =========================================================
SPEED LINES
========================================================= */

function createSpeedLine(
canvas
) {

const side =
    Math.random() >
    0.5
        ? "left"
        : "right";


const x =
    side === "left"

        ? Math.random() *
          canvas.width *
          0.25

        : canvas.width -
          Math.random() *
          canvas.width *
          0.25;


effectState.speedLines.push({

    x:
        x,

    y:
        Math.random() *
        canvas.height,

    length:
        8 +
        Math.random() *
        25,

    speed:
        6 +
        Math.random() *
        8,

    alpha:
        0.15 +
        Math.random() *
        0.4,

    life:
        20

});

}

/* =========================================================
UPDATE EFFECTS
========================================================= */

function updateEffects(
canvas
) {

updateParticles();

updateRings();

updateFloatingTexts();

updateSpeedLines(
    canvas
);

updateScreenEffects();

/*
 * Turbo trail.
 */

if (
    gameState.isPlaying &&
    gameState.turboActive
) {

    createTurboTrail(

        gameState.player.x,

        gameState.player.y

    );

}

/*
 * Speed lines hanya muncul
 * saat kecepatan cukup tinggi.
 */

if (
    gameState.isPlaying &&
    gameState.speed >
    6
) {

    const chance =
        Math.min(
            0.45,
            (
                gameState.speed -
                6
            ) *
            0.04
        );


    if (
        Math.random() <
        chance
    ) {

        createSpeedLine(
            canvas
        );

    }

}

}

/* =========================================================
UPDATE PARTICLES
========================================================= */

function updateParticles() {

for (
    let i =
        effectState.particles.length - 1;

    i >= 0;

    i--
) {

    const p =
        effectState.particles[i];


    p.x +=
        p.vx;


    p.y +=
        p.vy;


    p.vx *=
        p.friction;


    p.vy *=
        p.friction;


    p.vy +=
        p.gravity;


    p.life--;


    p.alpha =
        Math.max(
            0,
            p.life /
            p.maxLife
        );


    if (
        p.life <= 0
    ) {

        effectState.particles.splice(
            i,
            1
        );

    }

}

}

/* =========================================================
UPDATE RINGS
========================================================= */

function updateRings() {

for (
    let i =
        effectState.rings.length - 1;

    i >= 0;

    i--
) {

    const ring =
        effectState.rings[i];


    ring.radius +=
        ring.speed;


    ring.alpha =
        1 -
        (
            ring.radius /
            ring.maxRadius
        );


    if (
        ring.radius >=
        ring.maxRadius
    ) {

        effectState.rings.splice(
            i,
            1
        );

    }

}

}

/* =========================================================
UPDATE FLOATING TEXT
========================================================= */

function updateFloatingTexts() {

for (
    let i =
        effectState.floatingTexts.length - 1;

    i >= 0;

    i--
) {

    const text =
        effectState.floatingTexts[i];


    text.y +=
        text.vy;


    text.life--;


    text.alpha =
        Math.max(
            0,
            text.life /
            text.maxLife
        );


    if (
        text.life <= 0
    ) {

        effectState.floatingTexts.splice(
            i,
            1
        );

    }

}

}

/* =========================================================
UPDATE SPEED LINES
========================================================= */

function updateSpeedLines(
canvas
) {

for (
    let i =
        effectState.speedLines.length - 1;

    i >= 0;

    i--
) {

    const line =
        effectState.speedLines[i];


    line.y +=
        line.speed;


    line.life--;


    line.alpha *=
        0.96;


    if (
        line.y >
        canvas.height +
        line.length ||
        line.life <=
        0
    ) {

        effectState.speedLines.splice(
            i,
            1
        );

    }

}

}

/* =========================================================
UPDATE SCREEN EFFECTS
========================================================= */

function updateScreenEffects() {

if (
    effectState.screenShake >
    0
) {

    effectState.screenShake--;

}


if (
    effectState.screenShake <=
    0
) {

    effectState.screenShakePower =
        0;

}


if (
    effectState.screenFlash >
    0
) {

    effectState.screenFlash--;

    effectState.screenFlashAlpha *=
        0.8;

}


if (
    effectState.screenFlash <=
    0
) {

    effectState.screenFlashAlpha =
        0;

}

}

/* =========================================================
DRAW EFFECTS
========================================================= */

function drawEffects(
ctx,
canvas
) {

drawSpeedLines(
    ctx,
    canvas
);

drawParticles(
    ctx
);

drawRings(
    ctx
);

drawFloatingTexts(
    ctx
);

}

/* =========================================================
DRAW PARTICLES
========================================================= */

function drawParticles(
ctx
) {

for (
    const p of
    effectState.particles
) {

    ctx.save();

    ctx.globalAlpha =
        p.alpha;


    if (
        p.glow
    ) {

        ctx.shadowBlur =
            10;

        ctx.shadowColor =
            p.color;

    }


    ctx.fillStyle =
        p.color;


    ctx.beginPath();

    ctx.arc(

        p.x,

        p.y,

        p.size,

        0,

        Math.PI * 2

    );

    ctx.fill();


    ctx.restore();

}

}

/* =========================================================
DRAW RINGS
========================================================= */

function drawRings(
ctx
) {

for (
    const ring of
    effectState.rings
) {

    ctx.save();

    ctx.globalAlpha =
        ring.alpha;


    ctx.strokeStyle =
        ring.color;


    ctx.lineWidth =
        ring.width;


    ctx.shadowBlur =
        12;


    ctx.shadowColor =
        ring.color;


    ctx.beginPath();

    ctx.arc(

        ring.x,

        ring.y,

        ring.radius,

        0,

        Math.PI * 2

    );

    ctx.stroke();


    ctx.restore();

}

}

/* =========================================================
DRAW FLOATING TEXT
========================================================= */

function drawFloatingTexts(
ctx
) {

for (
    const text of
    effectState.floatingTexts
) {

    ctx.save();


    ctx.globalAlpha =
        text.alpha;


    ctx.fillStyle =
        text.color;


    ctx.shadowBlur =
        10;


    ctx.shadowColor =
        text.color;


    ctx.font =
        "bold 22px 'VT323', monospace";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(

        text.text,

        text.x,

        text.y

    );


    ctx.restore();

}

}

/* =========================================================
DRAW SPEED LINES
========================================================= */

function drawSpeedLines(
ctx,
canvas
) {

for (
    const line of
    effectState.speedLines
) {

    ctx.save();


    ctx.globalAlpha =
        line.alpha;


    ctx.strokeStyle =
        "#00ffcc";


    ctx.lineWidth =
        2;


    ctx.shadowBlur =
        8;


    ctx.shadowColor =
        "#00ffcc";


    ctx.beginPath();


    ctx.moveTo(

        line.x,

        line.y

    );


    ctx.lineTo(

        line.x,

        line.y +
        line.length

    );


    ctx.stroke();


    ctx.restore();

}

}

/* =========================================================
DRAW SCREEN FLASH
========================================================= */

function drawScreenFlash(
ctx,
canvas
) {

if (
    effectState.screenFlashAlpha <=
    0
) {

    return;

}


ctx.save();


ctx.globalAlpha =
    effectState.screenFlashAlpha;


ctx.fillStyle =
    effectState.screenFlashColor;


ctx.fillRect(

    0,

    0,

    canvas.width,

    canvas.height

);


ctx.restore();

}

/* =========================================================
CLEAR EFFECTS
========================================================= */

function clearEffects() {

effectState.particles.length =
    0;


effectState.rings.length =
    0;


effectState.sparks.length =
    0;


effectState.speedLines.length =
    0;


effectState.floatingTexts.length =
    0;


effectState.screenShake =
    0;


effectState.screenShakePower =
    0;


effectState.screenFlash =
    0;


effectState.screenFlashAlpha =
    0;

}

/* =========================================================
DEBUG INFO
========================================================= */

function getEffectsDebugInfo() {

return {

    particles:
        effectState.particles.length,

    rings:
        effectState.rings.length,

    floatingTexts:
        effectState.floatingTexts.length,

    speedLines:
        effectState.speedLines.length,

    screenShake:
        effectState.screenShake,

    screenFlash:
        effectState.screenFlash

};

}
