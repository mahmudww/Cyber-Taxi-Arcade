/* =========================================================
CYBER TAXI
RENDERER

Tanggung jawab:

Background
Neon city
Road
Lane markings
Roadside
Traffic
Power-ups
Player
Shield
Particles / effects
Screen overlay
Screen flash
Renderer HANYA menggambar.

Renderer TIDAK mengubah gameplay state.

FLOW:

GAME STATE
↓
GAME UPDATE
↓
RENDERER
↓
VISUAL

========================================================= */

/* =========================================================
RENDER STATE
========================================================= */

const renderState = {

time: 0,

roadOffset: 0,

skylineOffset: 0,

pulse: 0,

vignette: true

};

/* =========================================================
COLOR PALETTE
========================================================= */

const COLORS = {

background:
    "#030305",

skyTop:
    "#050313",

skyBottom:
    "#0b1118",

road:
    "#0b0f16",

roadDark:
    "#080b11",

sidewalk:
    "#111722",

lane:
    "#00ffcc",

neonPink:
    "#ff007f",

neonBlue:
    "#00aaff",

neonOrange:
    "#ffb86c",

yellow:
    "#fff36b",

white:
    "#ffffff",

dark:
    "#050508"

};

/* =========================================================
MAIN RENDER
========================================================= */

function renderGame(
ctx,
canvas
) {

if (!ctx || !canvas) {

    return;

}


/*
 * Logical canvas size.
 *
 * main.js menyimpan ukuran CSS
 * di gameWidth / gameHeight.
 */

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


if (
    width <= 0 ||
    height <= 0
) {

    return;

}


renderState.time++;
if (
    typeof gameState !== "undefined" &&
    gameState.isPlaying &&
    !gameState.isPaused
) {

    const worldSpeed =
        typeof getWorldSpeed === "function"
            ? getWorldSpeed()
            : (
                gameState.speed ||
                0
            );

    renderState.roadOffset +=
        worldSpeed;

}


/*
 * Road movement.
 */

if (
    typeof gameState !==
    "undefined"
) {

    renderState.roadOffset =
        gameState.roadOffset ||
        0;

}


/*
 * Screen shake.
 */

const shake =
    typeof getScreenShakeOffset ===
    "function"

        ? getScreenShakeOffset()

        : {
            x: 0,
            y: 0
        };


ctx.save();


ctx.translate(
    shake.x || 0,
    shake.y || 0
);


/*
 * Clear screen.
 */

ctx.fillStyle =
    COLORS.background;

ctx.fillRect(
    0,
    0,
    width,
    height
);


/* =====================================================
   WORLD
   ===================================================== */

drawBackground(
    ctx,
    canvas
);


drawRoad(
    ctx,
    canvas
);


drawRoadside(
    ctx,
    canvas
);


drawLaneMarkings(
    ctx,
    canvas
);


drawTraffic(
    ctx,
    canvas
);


drawPowerups(
    ctx,
    canvas
);


drawPlayer(
    ctx,
    canvas
);


/* =====================================================
   EFFECTS
   ===================================================== */

if (
    typeof drawEffects ===
    "function"
) {

    drawEffects(
        ctx,
        canvas
    );

}


drawScreenOverlay(
    ctx,
    canvas
);


ctx.restore();


/*
 * Screen flash harus berada
 * di paling atas.
 */

if (
    typeof drawScreenFlash ===
    "function"
) {

    drawScreenFlash(
        ctx,
        canvas
    );

}

}

/* =========================================================
BACKGROUND
========================================================= */

function drawBackground(
ctx,
canvas
) {

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


/*
 * Night sky gradient.
 */

const gradient =
    ctx.createLinearGradient(

        0,
        0,

        0,
        height

    );


gradient.addColorStop(
    0,
    COLORS.skyTop
);


gradient.addColorStop(
    0.45,
    "#090d18"
);


gradient.addColorStop(
    1,
    COLORS.skyBottom
);


ctx.fillStyle =
    gradient;


ctx.fillRect(
    0,
    0,
    width,
    height
);


/*
 * Moon / ambient city glow.
 */

const glow =
    ctx.createRadialGradient(

        width * 0.5,
        height * 0.28,
        5,

        width * 0.5,
        height * 0.28,
        width * 0.65

    );


glow.addColorStop(
    0,
    "rgba(0,255,204,0.08)"
);


glow.addColorStop(
    0.45,
    "rgba(255,0,127,0.035)"
);


glow.addColorStop(
    1,
    "rgba(0,0,0,0)"
);


ctx.fillStyle =
    glow;


ctx.fillRect(
    0,
    0,
    width,
    height
);


/*
 * Skyline.
 */

drawSkyline(
    ctx,
    canvas
);

}

/* =========================================================
SKYLINE
========================================================= */

function drawSkyline(
ctx,
canvas
) {

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


const horizon =
    Math.floor(
        height * 0.28
    );


const buildingWidth =
    Math.max(
        22,
        Math.min(
            36,
            width * 0.055
        )
    );


const offset =
    renderState.skylineOffset %
    buildingWidth;


ctx.save();


for (
    let x =
        -buildingWidth -
        offset;

    x <
        width +
        buildingWidth;

    x += buildingWidth
) {

    const index =
        Math.floor(
            (
                x +
                offset
            ) /
            buildingWidth
        );


    const seed =
        Math.abs(
            index
        );


    const buildingHeight =
        25 +
        (
            seed *
            17
        ) %
        95;


    const y =
        horizon -
        buildingHeight;


    /*
     * Building body.
     */

    ctx.fillStyle =
        seed % 3 === 0

            ? "#0b1020"

            : "#080c16";


    ctx.fillRect(

        x,

        y,

        buildingWidth - 3,

        buildingHeight

    );


    /*
     * Building roof light.
     */

    if (
        seed % 4 === 0
    ) {

        ctx.fillStyle =
            "rgba(0,255,204,0.4)";


        ctx.fillRect(

            x,

            y,

            buildingWidth - 3,

            2

        );

    }


    /*
     * Antenna.
     */

    if (
        seed % 5 === 0
    ) {

        ctx.strokeStyle =
            "rgba(0,255,204,0.35)";


        ctx.lineWidth =
            1;


        ctx.beginPath();


        ctx.moveTo(

            x +
            buildingWidth / 2,

            y

        );


        ctx.lineTo(

            x +
            buildingWidth / 2,

            y - 15

        );


        ctx.stroke();

    }


    /*
     * Windows.
     */

    const rows =
        Math.floor(
            buildingHeight /
            12
        );


    for (
        let r = 0;
        r < rows;
        r++
    ) {

        if (
            (
                seed +
                r
            ) %
            3 !==
            0
        ) {

            continue;

        }


        const windowColor =
            (
                seed +
                r
            ) %
            2 ===
            0

                ? "rgba(0,255,204,0.38)"

                : "rgba(255,0,127,0.32)";


        ctx.fillStyle =
            windowColor;


        ctx.fillRect(

            x + 5,

            y +
            7 +
            r * 12,

            4,

            5

        );

    }

}


/*
 * Horizon glow.
 */

const horizonGradient =
    ctx.createLinearGradient(

        0,
        horizon - 3,

        width,
        horizon + 8

    );


horizonGradient.addColorStop(
    0,
    "rgba(0,255,204,0)"
);


horizonGradient.addColorStop(
    0.5,
    "rgba(0,255,204,0.35)"
);


horizonGradient.addColorStop(
    1,
    "rgba(0,255,204,0)"
);


ctx.fillStyle =
    horizonGradient;


ctx.fillRect(

    0,

    horizon - 2,

    width,

    8

);


ctx.restore();


/*
 * Skyline bergerak sangat pelan.
 */

renderState.skylineOffset +=
    0.15;

}

/* =========================================================
ROAD
========================================================= */

function drawRoad(
ctx,
canvas
) {

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


const roadLeft =
    getRoadLeft(canvas);


const roadRight =
    getRoadRight(canvas);


/*
 * Road base.
 */

ctx.fillStyle =
    COLORS.road;


ctx.fillRect(

    roadLeft,

    0,

    roadRight -
    roadLeft,

    height

);


/*
 * Road center gradient.
 */

const gradient =
    ctx.createLinearGradient(

        roadLeft,
        0,

        roadRight,
        0

    );


gradient.addColorStop(
    0,
    "rgba(0,255,204,0.015)"
);


gradient.addColorStop(
    0.5,
    "rgba(0,255,204,0.04)"
);


gradient.addColorStop(
    1,
    "rgba(255,0,127,0.015)"
);


ctx.fillStyle =
    gradient;


ctx.fillRect(

    roadLeft,

    0,

    roadRight -
    roadLeft,

    height

);


/*
 * Road texture.
 */

drawRoadTexture(

    ctx,

    canvas,

    roadLeft,

    roadRight

);


/*
 * Neon road edges.
 */

ctx.save();


ctx.shadowBlur =
    10;


ctx.shadowColor =
    COLORS.lane;


ctx.strokeStyle =
    COLORS.lane;


ctx.lineWidth =
    2;


ctx.beginPath();


ctx.moveTo(
    roadLeft,
    0
);


ctx.lineTo(
    roadLeft,
    height
);


ctx.stroke();


ctx.strokeStyle =
    COLORS.neonPink;


ctx.shadowColor =
    COLORS.neonPink;


ctx.beginPath();


ctx.moveTo(
    roadRight,
    0
);


ctx.lineTo(
    roadRight,
    height
);


ctx.stroke();


ctx.restore();

}

/* =========================================================
ROAD TEXTURE
========================================================= */

function drawRoadTexture(
ctx,
canvas,
left,
right
) {

const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


const offset =
    renderState.roadOffset %
    60;


ctx.save();


ctx.globalAlpha =
    0.08;


ctx.strokeStyle =
    "#ffffff";


ctx.lineWidth =
    1;


for (
    let y =
        -60 +
        offset;

    y <
        height +
        60;

    y += 60
) {

    ctx.beginPath();


    ctx.moveTo(
        left + 20,
        y
    );


    ctx.lineTo(
        right - 20,
        y
    );


    ctx.stroke();

}


ctx.restore();

}

/* =========================================================
ROADSIDE
========================================================= */

function drawRoadside(
ctx,
canvas
) {

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


const left =
    getRoadLeft(canvas);


const right =
    getRoadRight(canvas);


/*
 * Sidewalk.
 */

ctx.fillStyle =
    COLORS.sidewalk;


ctx.fillRect(

    0,
    0,

    left,
    height

);


ctx.fillRect(

    right,
    0,

    width -
    right,

    height

);


/*
 * Neon side blocks.
 */

const offset =
    renderState.roadOffset %
    80;


for (
    let y =
        -80 +
        offset;

    y <
        height +
        80;

    y += 80
) {

    drawNeonSideBlock(

        ctx,

        left * 0.5,

        y,

        left,

        COLORS.lane

    );


    drawNeonSideBlock(

        ctx,

        right +
        (
            width -
            right
        ) *
        0.5,

        y + 40,

        width -
        right,

        COLORS.neonPink

    );

}

}

/* =========================================================
NEON SIDE BLOCK
========================================================= */

function drawNeonSideBlock(
ctx,
x,
y,
width,
color
) {

const blockWidth =
    Math.min(
        width * 0.6,
        12
    );


ctx.save();


ctx.fillStyle =
    color;


ctx.shadowBlur =
    10;


ctx.shadowColor =
    color;


ctx.globalAlpha =
    0.55;


ctx.fillRect(

    x -
    blockWidth / 2,

    y,

    blockWidth,

    24

);


ctx.restore();

}

/* =========================================================
LANE MARKINGS
========================================================= */

function drawLaneMarkings(
ctx,
canvas
) {

const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


const lanes =
    getLanePositions(canvas);


const offset =
    renderState.roadOffset %
    50;


ctx.save();


ctx.setLineDash([
    18,
    22
]);


ctx.lineDashOffset =
    offset;


ctx.lineWidth =
    2;


for (
    let i = 0;

    i <
    lanes.length - 1;

    i++
) {

    const x =
        (
            lanes[i] +
            lanes[i + 1]
        ) /
        2;


    ctx.strokeStyle =
        "rgba(0,255,204,0.7)";


    ctx.shadowBlur =
        8;


    ctx.shadowColor =
        COLORS.lane;


    ctx.beginPath();


    ctx.moveTo(
        x,
        0
    );


    ctx.lineTo(
        x,
        height
    );


    ctx.stroke();

}


ctx.setLineDash([]);


ctx.restore();

}

/* =========================================================
TRAFFIC
========================================================= */

function drawTraffic(
ctx,
canvas
) {

if (
    typeof entities ===
    "undefined"
) {

    return;

}


/*
 * Traffic disimpan sebagai
 * obstacles di state.js.
 */

if (
    !Array.isArray(
        entities.obstacles
    )
) {

    return;

}


for (
    const vehicle of
    entities.obstacles
) {

    if (!vehicle) {

        continue;

    }


    drawTrafficVehicle(

        ctx,

        vehicle

    );

}

}

/* =========================================================
TRAFFIC VEHICLE
========================================================= */

function drawTrafficVehicle(
    ctx,
    vehicle
) {

    const x =
        getLaneX(
            vehicle.lane
        );

    const color =
        vehicle.color ||
        COLORS.neonPink;

    drawCar(

        ctx,

        x,

        vehicle.y,

        vehicle.width,

        vehicle.height,

        color,

        false,

        vehicle.type

    );

}

/* =========================================================
POWERUPS
========================================================= */

function drawPowerups(
ctx,
canvas
) {

if (
    typeof entities ===
    "undefined"
) {

    return;

}


if (
    !Array.isArray(
        entities.powerups
    )
) {

    return;

}


for (
    const powerup of
    entities.powerups
) {

    if (!powerup) {

        continue;

    }


    drawPowerup(

        ctx,

        powerup

    );

}

}

/* =========================================================
POWERUP DRAWING
========================================================= */

function drawPowerup(
ctx,
powerup
) {

const lane =
    Number.isFinite(
        powerup.lane
    )

        ? powerup.lane

        : 0;


const x =
    Number.isFinite(
        powerup.x
    )

        ? powerup.x

        : getLaneX(lane);


const y =
    Number.isFinite(
        powerup.y
    )

        ? powerup.y

        : 0;


const type =
    powerup.type ||
    "shield";


const pulse =
    Math.sin(
        renderState.time *
        0.12
    );


const radius =
    13 +
    pulse * 2;


const color =
    type === "turbo"

        ? COLORS.neonPink

        : COLORS.lane;


ctx.save();


/*
 * Glow.
 */

ctx.shadowBlur =
    18;


ctx.shadowColor =
    color;


ctx.fillStyle =
    color;


ctx.globalAlpha =
    0.2;


ctx.beginPath();


ctx.arc(

    x,
    y,

    radius + 5,

    0,

    Math.PI * 2

);


ctx.fill();


/*
 * Main orb.
 */

ctx.globalAlpha =
    0.9;


ctx.fillStyle =
    color;


ctx.beginPath();


ctx.arc(

    x,
    y,

    radius,

    0,

    Math.PI * 2

);


ctx.fill();


/*
 * Inner core.
 */

ctx.shadowBlur =
    0;


ctx.fillStyle =
    COLORS.dark;


ctx.beginPath();


ctx.arc(

    x,
    y,

    radius * 0.55,

    0,

    Math.PI * 2

);


ctx.fill();


/*
 * Symbol.
 */

ctx.fillStyle =
    COLORS.white;


ctx.font =
    "bold 13px monospace";


ctx.textAlign =
    "center";


ctx.textBaseline =
    "middle";


ctx.fillText(

    type === "turbo"
        ? "T"
        : "S",

    x,

    y + 1

);


ctx.restore();

}

/* =========================================================
PLAYER
========================================================= */

function drawPlayer(
ctx,
canvas
) {

if (
    typeof gameState ===
    "undefined"
) {

    return;

}


if (
    !gameState.player
) {

    return;

}


const player =
    gameState.player;


/*
 * IMPORTANT:
 *
 * Player.js sekarang mengontrol
 * posisi smooth player.x.
 *
 * Renderer TIDAK mengubah player.x.
 */

let x =
    Number.isFinite(
        player.x
    )

        ? player.x

        : getLaneX(
            player.targetLane
        );


let y =
    Number.isFinite(
        player.y
    )

        ? player.y

        : 0;


let lean =
    0;


/*
 * Ambil visual position
 * dari player.js.
 */

if (
    typeof getPlayerDrawPosition ===
    "function"
) {

    const drawPosition =
        getPlayerDrawPosition();


    if (
        drawPosition &&
        Number.isFinite(
            drawPosition.x
        )
    ) {

        x =
            drawPosition.x;

    }


    if (
        drawPosition &&
        Number.isFinite(
            drawPosition.y
        )
    ) {

        y =
            drawPosition.y;

    }


    if (
        drawPosition &&
        Number.isFinite(
            drawPosition.lean
        )
    ) {

        lean =
            drawPosition.lean;

    }

}


/*
 * Shadow.
 */

ctx.save();


ctx.fillStyle =
    "rgba(0,0,0,0.45)";


ctx.beginPath();


ctx.ellipse(

    x,

    y +
    player.height -
    3,

    player.width *
    0.65,

    8,

    0,

    0,

    Math.PI * 2

);


ctx.fill();


ctx.restore();


/*
 * Turbo trail.
 */

if (
    gameState.turboActive
) {

    drawTurboFlame(

        ctx,

        x,

        y +
        player.height

    );

}


/*
 * Taxi.
 */

drawCar(

    ctx,

    x,

    y,

    player.width,

    player.height,

    COLORS.lane,

    true,

    "taxi",

    lean

);


/*
 * Shield.
 */

if (
    player.shields >
    0
) {

    drawShield(

        ctx,

        x,

        y +
        player.height / 2,

        player.shields

    );

}

}

/* =========================================================
CAR DRAWING
========================================================= */

function drawCar(
ctx,
x,
y,
width,
height,
primaryColor,
isPlayer,
type,
tilt = 0
) {

ctx.save();


/*
 * Position.
 */

ctx.translate(
    x,
    y
);


/*
 * Tilt hanya visual.
 */

if (
    isPlayer
) {

    ctx.rotate(
        tilt
    );

}


const w =
    width;


const h =
    height;


const left =
    -w / 2;


/*
 * Shadow.
 */

ctx.fillStyle =
    "rgba(0,0,0,0.55)";


ctx.fillRect(

    left - 5,

    7,

    w + 10,

    Math.max(
        10,
        h - 10
    )

);


/*
 * Wheels.
 */

drawWheel(
    ctx,
    left - 5,
    17
);


drawWheel(
    ctx,
    w / 2 + 5,
    17
);


drawWheel(
    ctx,
    left - 5,
    h - 35
);


drawWheel(
    ctx,
    w / 2 + 5,
    h - 35
);


/*
 * Main body.
 */

ctx.fillStyle =
    primaryColor;


ctx.beginPath();


ctx.moveTo(

    left + 8,

    2

);


ctx.lineTo(

    w / 2 - 8,

    2

);


ctx.quadraticCurveTo(

    w / 2,

    10,

    w / 2,

    25

);


ctx.lineTo(

    w / 2 - 3,

    h - 8

);


ctx.quadraticCurveTo(

    0,

    h + 2,

    left + 3,

    h - 8

);


ctx.lineTo(

    left,

    25

);


ctx.quadraticCurveTo(

    left + 2,

    10,

    left + 8,

    2

);


ctx.closePath();


ctx.fill();


/*
 * Neon outline.
 */

ctx.strokeStyle =
    isPlayer

        ? COLORS.white

        : primaryColor;


ctx.lineWidth =
    isPlayer

        ? 1.8

        : 1.3;


ctx.shadowBlur =
    isPlayer

        ? 10

        : 6;


ctx.shadowColor =
    primaryColor;


ctx.stroke();


/*
 * Hood.
 */

ctx.shadowBlur =
    0;


ctx.fillStyle =
    isPlayer

        ? "#00b38f"

        : darkenColor(
            primaryColor,
            0.45
        );


ctx.fillRect(

    left + 7,

    7,

    w - 14,

    11

);


/*
 * Windshield.
 */

ctx.fillStyle =
    "#05070c";


ctx.beginPath();


ctx.moveTo(

    left + 6,

    23

);


ctx.lineTo(

    w / 2 - 6,

    23

);


ctx.lineTo(

    w / 2 - 4,

    42

);


ctx.lineTo(

    left + 4,

    42

);


ctx.closePath();


ctx.fill();


/*
 * Windshield highlight.
 */

ctx.strokeStyle =
    "rgba(255,255,255,0.18)";


ctx.lineWidth =
    1;


ctx.beginPath();


ctx.moveTo(

    left + 8,

    25

);


ctx.lineTo(

    w / 2 - 8,

    25

);


ctx.stroke();


/*
 * Cabin.
 */

ctx.fillStyle =
    primaryColor;


ctx.globalAlpha =
    0.85;


ctx.fillRect(

    left + 5,

    44,

    w - 10,

    20

);


ctx.globalAlpha =
    1;


/*
 * Rear window.
 */

ctx.fillStyle =
    "#05070c";


ctx.fillRect(

    left + 6,

    66,

    w - 12,

    8

);


/*
 * Taxi roof sign.
 */

if (
    isPlayer
) {

    ctx.fillStyle =
        COLORS.neonPink;


    ctx.shadowBlur =
        10;


    ctx.shadowColor =
        COLORS.neonPink;


    ctx.fillRect(

        left + 10,

        49,

        w - 20,

        9

    );


    ctx.shadowBlur =
        0;


    ctx.fillStyle =
        COLORS.white;


    ctx.font =
        "bold 9px monospace";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(

        "TAXI",

        0,

        54

    );

}


/*
 * Lights.
 */

if (
    isPlayer
) {

    /*
     * Headlights.
     */

    ctx.fillStyle =
        COLORS.yellow;


    ctx.shadowBlur =
        8;


    ctx.shadowColor =
        "#ffff00";


    ctx.fillRect(

        left + 2,

        1,

        7,

        5

    );


    ctx.fillRect(

        w / 2 - 9,

        1,

        7,

        5

    );

} else {

    /*
     * Rear lights.
     */

    ctx.fillStyle =
        "#ff3030";


    ctx.shadowBlur =
        8;


    ctx.shadowColor =
        "#ff0000";


    ctx.fillRect(

        left + 2,

        h - 6,

        8,

        5

    );


    ctx.fillRect(

        w / 2 - 10,

        h - 6,

        8,

        5

    );

}


/*
 * Traffic type detail.
 */

if (
    !isPlayer &&
    type === "police"
) {

    drawPoliceLight(
        ctx,
        w,
        h
    );

}


ctx.restore();

}

/* =========================================================
POLICE LIGHT
========================================================= */

function drawPoliceLight(
ctx,
width,
height
) {

const pulse =
    Math.floor(
        renderState.time /
        8
    ) %
    2;


ctx.save();


ctx.shadowBlur =
    8;


if (
    pulse === 0
) {

    ctx.fillStyle =
        COLORS.neonBlue;


    ctx.shadowColor =
        COLORS.neonBlue;

} else {

    ctx.fillStyle =
        COLORS.neonPink;


    ctx.shadowColor =
        COLORS.neonPink;

}


ctx.fillRect(

    -8,

    height * 0.48,

    16,

    4

);


ctx.restore();

}

/* =========================================================
WHEEL
========================================================= */

function drawWheel(
ctx,
x,
y
) {

ctx.save();


ctx.fillStyle =
    "#020204";


ctx.fillRect(

    x - 3,

    y,

    6,

    21

);


ctx.fillStyle =
    "#687386";


ctx.fillRect(

    x - 2,

    y + 5,

    4,

    9

);


ctx.restore();

}

/* =========================================================
TURBO FLAME
========================================================= */

function drawTurboFlame(
ctx,
x,
y
) {

const pulse =
    Math.sin(
        renderState.time *
        0.25
    );


ctx.save();


ctx.translate(
    x,
    y
);


/*
 * Outer flame.
 */

ctx.fillStyle =
    COLORS.neonPink;


ctx.shadowBlur =
    18;


ctx.shadowColor =
    COLORS.neonPink;


ctx.beginPath();


ctx.moveTo(
    -10,
    0
);


ctx.lineTo(
    10,
    0
);


ctx.lineTo(

    6,

    24 +
    pulse * 5

);


ctx.lineTo(
    0,
    17
);


ctx.lineTo(

    -6,

    24 +
    pulse * 5

);


ctx.closePath();


ctx.fill();


/*
 * Inner flame.
 */

ctx.fillStyle =
    COLORS.neonOrange;


ctx.shadowColor =
    COLORS.neonOrange;


ctx.beginPath();


ctx.moveTo(
    -5,
    0
);


ctx.lineTo(
    5,
    0
);


ctx.lineTo(

    0,

    20 +
    pulse * 4

);


ctx.closePath();


ctx.fill();


ctx.restore();

}

/* =========================================================
SHIELD
========================================================= */

function drawShield(
ctx,
x,
y,
shields
) {

const pulse =
    Math.sin(
        renderState.time *
        0.08
    );


const radius =
    45 +
    pulse * 2;


ctx.save();


ctx.globalAlpha =
    0.45;


ctx.strokeStyle =
    COLORS.lane;


ctx.lineWidth =
    2.5;


ctx.shadowBlur =
    15;


ctx.shadowColor =
    COLORS.lane;


ctx.beginPath();


ctx.arc(

    x,

    y,

    radius,

    0,

    Math.PI * 2

);


ctx.stroke();


/*
 * Shield nodes.
 */

for (
    let i = 0;

    i <
    shields;

    i++
) {

    const angle =
        (
            renderState.time *
            0.02
        ) +
        (
            i *
            Math.PI *
            2 /
            Math.max(
                shields,
                1
            )
        );


    const nodeX =
        x +
        Math.cos(angle) *
        radius;


    const nodeY =
        y +
        Math.sin(angle) *
        radius;


    ctx.globalAlpha =
        0.9;


    ctx.fillStyle =
        COLORS.lane;


    ctx.beginPath();


    ctx.arc(

        nodeX,

        nodeY,

        3,

        0,

        Math.PI * 2

    );


    ctx.fill();

}


ctx.restore();

}

/* =========================================================
SCREEN OVERLAY
========================================================= */

function drawScreenOverlay(
ctx,
canvas
) {

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


const height =
    canvas.gameHeight ||
    canvas.clientHeight ||
    canvas.height;


/*
 * Vignette.
 */

if (
    renderState.vignette
) {

    const vignette =
        ctx.createRadialGradient(

            width / 2,
            height / 2,
            height * 0.2,

            width / 2,
            height / 2,
            height * 0.8

        );


    vignette.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );


    vignette.addColorStop(
        0.75,
        "rgba(0,0,0,0.08)"
    );


    vignette.addColorStop(
        1,
        "rgba(0,0,0,0.5)"
    );


    ctx.fillStyle =
        vignette;


    ctx.fillRect(

        0,
        0,

        width,
        height

    );

}


/*
 * CRT scanlines.
 */

ctx.save();


ctx.globalAlpha =
    0.08;


ctx.fillStyle =
    "#000000";


for (
    let y = 0;

    y <
    height;

    y += 4
) {

    ctx.fillRect(

        0,

        y,

        width,

        1

    );

}


ctx.restore();

}

/* =========================================================
ROAD HELPERS
========================================================= */

function getRoadLeft(
canvas
) {

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


return Math.max(

    18,

    width *
    0.09

);

}

function getRoadRight(
canvas
) {

const width =
    canvas.gameWidth ||
    canvas.clientWidth ||
    canvas.width;


return Math.min(

    width - 18,

    width *
    0.91

);

}

/* =========================================================
LANE HELPERS
========================================================= */

function getLanePositions(
canvas
) {

const left =
    getRoadLeft(canvas);


const right =
    getRoadRight(canvas);


const laneCount =
    (
        typeof GAME_CONFIG !==
        "undefined" &&
        GAME_CONFIG.ROAD &&
        GAME_CONFIG.ROAD.laneCount
    )

        ? GAME_CONFIG.ROAD.laneCount

        : 3;


const width =
    right -
    left;


const lanes = [];


for (
    let i = 0;

    i <
    laneCount;

    i++
) {

    lanes.push(

        left +
        width *
        (
            i +
            0.5
        ) /
        laneCount

    );

}


return lanes;

}

/* =========================================================
GET LANE X
========================================================= */

function getLaneX(
lane
) {

const canvas =
    document.getElementById(
        "gameCanvas"
    );


if (!canvas) {

    return 0;

}


const lanes =
    getLanePositions(
        canvas
    );


if (
    lanes.length === 0
) {

    return 0;

}


const safeLane =
    Math.max(

        0,

        Math.min(

            lanes.length - 1,

            Number.isFinite(lane)
                ? lane
                : 0

        )

    );


return lanes[
    safeLane
];

}

/* =========================================================
COLOR DARKENER
========================================================= */

function darkenColor(
color,
amount
) {

/*
 * Support HEX sederhana.
 */

if (
    !color ||
    color[0] !== "#"
) {

    return color;

}


const hex =
    color.substring(1);


if (
    hex.length !== 6
) {

    return color;

}


const r =
    parseInt(

        hex.substring(
            0,
            2
        ),

        16

    );


const g =
    parseInt(

        hex.substring(
            2,
            4
        ),

        16

    );


const b =
    parseInt(

        hex.substring(
            4,
            6
        ),

        16

    );


const factor =
    Math.max(

        0,

        Math.min(

            1,

            1 -
            amount

        )

    );


const nr =
    Math.floor(
        r *
        factor
    );


const ng =
    Math.floor(
        g *
        factor
    );


const nb =
    Math.floor(
        b *
        factor
    );


return (

    `rgb(${nr}, ${ng}, ${nb})`

);

}

/* =========================================================
RESIZE
========================================================= */

function resizeRenderer(
canvas
) {

if (!canvas) {

    return;

}


/*
 * Renderer menggunakan ukuran canvas
 * secara dinamis.

 * Tidak perlu mengubah state di sini.
 */

}

/* =========================================================
DEBUG
========================================================= */

function getRendererDebugInfo() {

return {

    frame:
        renderState.time,

    roadOffset:
        Number(

            renderState.roadOffset
                .toFixed(2)

        ),

    skylineOffset:
        Number(

            renderState.skylineOffset
                .toFixed(2)

        )

};

}
