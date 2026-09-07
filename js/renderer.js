/* =========================================================
CYBER TAXI
RENDERER
Renderer bertanggung jawab untuk:

background
road
lane markings
roadside neon
traffic
player
power-ups
shield
particles / effects
speed lines
screen flash
HUD visual canvas
Renderer TIDAK mengubah gameplay state.

Prinsip:

GAME STATE
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

pulse:
    0,

vignette:
    true

};

/* =========================================================
COLOR PALETTE
========================================================= */

const COLORS = {

background:
    "#030305",

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

renderState.time++;

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
    shake.x,
    shake.y
);

/*
 * Base clear.
 */

ctx.fillStyle =
    COLORS.background;

ctx.fillRect(

    -20,

    -20,

    canvas.width + 40,

    canvas.height + 40

);

/*
 * World.
 */

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

/*
 * Effects.
 */

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
 * Screen flash berada paling atas.
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

/*
 * Gradient langit.
 */

const gradient =
    ctx.createLinearGradient(

        0,
        0,

        0,
        canvas.height

    );

gradient.addColorStop(
    0,
    "#050313"
);

gradient.addColorStop(
    0.45,
    "#090d18"
);

gradient.addColorStop(
    1,
    "#0b1118"
);

ctx.fillStyle =
    gradient;

ctx.fillRect(

    0,
    0,

    canvas.width,
    canvas.height

);

/*
 * Neon skyline.
 */

drawSkyline(
    ctx,
    canvas
);

/*
 * Ambient glow.
 */

const glow =
    ctx.createRadialGradient(

        canvas.width * 0.5,
        canvas.height * 0.35,
        10,

        canvas.width * 0.5,
        canvas.height * 0.35,
        canvas.width * 0.7

    );

glow.addColorStop(
    0,
    "rgba(0,255,204,0.08)"
);

glow.addColorStop(
    0.5,
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

    canvas.width,
    canvas.height

);

}

/* =========================================================
SKYLINE
========================================================= */

function drawSkyline(
ctx,
canvas
) {

const horizon =
    Math.floor(
        canvas.height *
        0.28
    );

const buildingWidth =
    28;

const offset =
    renderState.skylineOffset %
    buildingWidth;

ctx.save();

for (
    let x =
        -buildingWidth -
        offset;

    x <
        canvas.width +
        buildingWidth;

    x += buildingWidth
) {

    const seed =
        Math.abs(
            Math.floor(
                x / buildingWidth
            )
        );

    const height =
        25 +
        (
            seed *
            17
        ) %
        95;

    const y =
        horizon -
        height;

    ctx.fillStyle =
        seed % 3 === 0

            ? "#0b1020"

            : "#080c16";

    ctx.fillRect(

        x,

        y,

        buildingWidth - 3,

        height

    );

    /*
     * Building antennas.
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
            height / 12
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

        ctx.fillStyle =
            (
                seed +
                r
            ) %
            2 ===
            0

                ? "rgba(0,255,204,0.35)"

                : "rgba(255,0,127,0.3)";

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
 * Horizon glow line.
 */

const horizonGradient =
    ctx.createLinearGradient(

        0,
        horizon - 3,

        canvas.width,
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

    canvas.width,

    8

);

ctx.restore();

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

    canvas.height

);

/*
 * Road center glow.
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
    "rgba(0,255,204,0.035)"
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

    canvas.height

);

/*
 * Subtle road texture.
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
    canvas.height
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
    canvas.height
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

/*
 * Texture sangat ringan agar mobile
 * tidak terlalu terbebani.
 */

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
        canvas.height +
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
    canvas.height

);

ctx.fillRect(

    right,
    0,

    canvas.width -
    right,

    canvas.height

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
        canvas.height +
        80;

    y += 80
) {

    drawNeonSideBlock(

        ctx,

        left * 0.5,

        y,

        left,

        "#00ffcc"

    );

    drawNeonSideBlock(

        ctx,

        right +
        (
            canvas.width -
            right
        ) *
        0.5,

        y + 40,

        canvas.width -
        right,

        "#ff007f"

    );

}

}

/* =========================================================
SIDE BLOCK
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

const lanes =
    getLanePositions(
        canvas
    );

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
        "#00ffcc";

    ctx.beginPath();

    ctx.moveTo(
        x,
        0
    );

    ctx.lineTo(
        x,
        canvas.height
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

for (
    const vehicle of
    entities.traffic
) {

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

vehicle.x =
    x;

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
PLAYER
========================================================= */

function drawPlayer(
ctx,
canvas
) {

if (
    !gameState.player
) {

    return;

}

const player =
    gameState.player;

const x =
    getLaneX(
        player.targetLane
    );

/*
 * Update visual X.

 * Gameplay tetap mengontrol lane,
 * renderer hanya mengikuti.
 */

player.x =
    x;

/*
 * Shadow.
 */

ctx.save();

ctx.fillStyle =
    "rgba(0,0,0,0.45)";

ctx.beginPath();

ctx.ellipse(

    x,

    player.y +
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

        player.y +
        player.height

    );

}

/*
 * Taxi.
 */

drawCar(

    ctx,

    x,

    player.y,

    player.width,

    player.height,

    "#00ffcc",

    true,

    "taxi"

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

        player.y +
        player.height /
        2,

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
type
) {

ctx.save();

/*
 * Tiny visual tilt.

 * Player sedikit miring ketika pindah lane.
 */

let tilt =
    0;

if (
    isPlayer &&
    typeof playerState !==
    "undefined"
) {

    tilt =
        playerState.visualTilt ||
        0;

}

ctx.translate(
    x,
    y
);

ctx.rotate(
    tilt
);

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

    h - 10

);

/*
 * Tires.
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
        ? "#ffffff"
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
        "#ff007f";

    ctx.shadowBlur =
        10;

    ctx.shadowColor =
        "#ff007f";

    ctx.fillRect(

        left + 10,

        49,

        w - 20,

        9

    );

    ctx.shadowBlur =
        0;

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 9px 'VT323', monospace";

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
 * Headlights / rear lights.
 */

if (
    isPlayer
) {

    ctx.fillStyle =
        "#fff36b";

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
    "#ff007f";

ctx.shadowBlur =
    18;

ctx.shadowColor =
    "#ff007f";

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
    "#ffb86c";

ctx.shadowColor =
    "#ffb86c";

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
    "#00ffcc";

ctx.lineWidth =
    2.5;

ctx.shadowBlur =
    15;

ctx.shadowColor =
    "#00ffcc";

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
 * Small shield nodes.
 */

for (
    let i = 0;
    i < shields;
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
        "#00ffcc";

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

/*
 * Vignette.
 */

if (
    renderState.vignette
) {

    const vignette =
        ctx.createRadialGradient(

            canvas.width / 2,
            canvas.height / 2,
            canvas.height * 0.2,

            canvas.width / 2,
            canvas.height / 2,
            canvas.height * 0.8

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

        canvas.width,
        canvas.height

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
    y < canvas.height;
    y += 4
) {

    ctx.fillRect(

        0,

        y,

        canvas.width,

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

return Math.max(

    18,

    canvas.width *
    0.09

);

}

function getRoadRight(
canvas
) {

return Math.min(

    canvas.width - 18,

    canvas.width *
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
    GAME_CONFIG.ROAD.laneCount;

const width =
    right -
    left;

const lanes = [];

for (
    let i = 0;
    i < laneCount;
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

/*
 * Canvas global tersedia dari game.
 */

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

const safeLane =
    Math.max(

        0,

        Math.min(

            lanes.length - 1,

            lane

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
 * Support warna HEX sederhana.
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
        hex.substring(0, 2),
        16
    );

const g =
    parseInt(
        hex.substring(2, 4),
        16
    );

const b =
    parseInt(
        hex.substring(4, 6),
        16
    );

const nr =
    Math.floor(
        r *
        (
            1 -
            amount
        )
    );

const ng =
    Math.floor(
        g *
        (
            1 -
            amount
        )
    );

const nb =
    Math.floor(
        b *
        (
            1 -
            amount
        )
    );

return `rgb(${nr}, ${ng}, ${nb})`;

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
 * Semua posisi dihitung relatif terhadap
 * ukuran canvas.

 * Jadi renderer otomatis responsif
 * untuk HP maupun laptop.
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
            renderState.roadOffset.toFixed(2)
        ),

    skylineOffset:
        Number(
            renderState.skylineOffset.toFixed(2)
        )

};

}
