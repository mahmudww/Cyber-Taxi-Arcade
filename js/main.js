/* =========================================================
CYBER TAXI
MAIN / BOOTSTRAP

Tanggung jawab:

DOM initialization
Canvas initialization
Game loop
Delta time
Resize handling
Koordinasi update + rendering

Gameplay → game.js
Rendering → renderer.js
UI → ui.js
State → state.js
========================================================= */

(function () {

"use strict";

/* =========================================================
CANVAS
========================================================= */

let canvas = null;

let ctx = null;

/* =========================================================
GAME LOOP
========================================================= */

let lastTime = 0;

let animationFrameId = null;

/*

Delta time maksimum.
Kalau browser sempat freeze,
game tidak akan tiba-tiba melompat terlalu jauh.
*/

const MAX_DELTA_TIME = 0.05;

/* =========================================================
INITIALIZE CANVAS
========================================================= */

function initializeCanvas() {

canvas =
    document.getElementById(
        "gameCanvas"
    );


if (!canvas) {

    console.error(
        "[Cyber Taxi] gameCanvas not found."
    );

    return false;

}


ctx =
    canvas.getContext(
        "2d"
    );


if (!ctx) {

    console.error(
        "[Cyber Taxi] Unable to create 2D context."
    );

    return false;

}


/*
 * High-DPI / Retina support.
 *
 * Canvas tetap terlihat tajam
 * di HP maupun laptop.
 */

resizeCanvas();


/*
 * Browser resize.
 */

window.addEventListener(
    "resize",
    resizeCanvas
);


/*
 * Mobile orientation change.
 */

window.addEventListener(
    "orientationchange",
    function () {

        setTimeout(
            resizeCanvas,
            100
        );

    }
);


return true;


}

/* =========================================================
RESIZE CANVAS
========================================================= */

function resizeCanvas() {

if (!canvas || !ctx) {

    return;

}


/*
 * Ukuran CSS sebenarnya.
 */

const rect =
    canvas.getBoundingClientRect();


const width =
    Math.max(
        1,
        Math.floor(rect.width)
    );


const height =
    Math.max(
        1,
        Math.floor(rect.height)
    );


/*
 * Device pixel ratio.
 *
 * Dibatasi supaya HP dengan DPR
 * sangat tinggi tidak membuat canvas
 * terlalu berat.
 */

const dpr =
    Math.min(
        window.devicePixelRatio || 1,
        2
    );


/*
 * Internal canvas resolution.
 */

canvas.width =
    Math.floor(
        width * dpr
    );


canvas.height =
    Math.floor(
        height * dpr
    );


/*
 * Semua sistem game bekerja
 * menggunakan koordinat CSS pixel.
 */

ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
);


/*
 * Simpan ukuran logical canvas
 * supaya sistem game tidak bingung
 * dengan DPR.
 */

canvas.gameWidth =
    width;

canvas.gameHeight =
    height;


/*
 * Notify renderer.
 */

if (
    typeof resizeRenderer ===
    "function"
) {

    resizeRenderer(
        canvas
    );

}


/*
 * Notify player.
 */

if (
    typeof handlePlayerResize ===
    "function"
) {

    handlePlayerResize(
        canvas
    );

}


}

/* =========================================================
GAME LOOP
========================================================= */

function gameLoop(timestamp) {

/*
 * First frame.
 */

if (!lastTime) {

    lastTime =
        timestamp;

}


/*
 * Delta time dalam detik.
 */

let dt =
    (
        timestamp -
        lastTime
    ) / 1000;


lastTime =
    timestamp;


/*
 * Clamp delta time.
 */

dt =
    Math.min(
        dt,
        MAX_DELTA_TIME
    );


/*
 * Simpan delta ke game state
 * kalau state tersedia.
 */

if (
    typeof gameState !==
    "undefined"
) {

    gameState.deltaTime =
        dt;

}


/* =====================================================
   UPDATE
   ===================================================== */

if (
    typeof updateGame ===
    "function"
) {

    updateGame(
        dt
    );

}


/* =====================================================
   RENDER
   ===================================================== */

if (
    typeof renderGame ===
    "function"
) {

    /*
     * IMPORTANT:
     *
     * renderer membutuhkan:
     *
     * renderGame(ctx, canvas)
     */

    renderGame(
        ctx,
        canvas
    );

}


/* =====================================================
   UI
   ===================================================== */

if (
    typeof updateUI ===
    "function"
) {

    updateUI();

}


/*
 * Continue loop.
 */

animationFrameId =
    requestAnimationFrame(
        gameLoop
    );


}

/* =========================================================
START LOOP
========================================================= */

function startLoop() {

/*
 * Prevent duplicate loop.
 */

if (
    animationFrameId !== null
) {

    cancelAnimationFrame(
        animationFrameId
    );

}


lastTime =
    0;


animationFrameId =
    requestAnimationFrame(
        gameLoop
    );


}

/* =========================================================
STOP LOOP
========================================================= */

function stopLoop() {

if (
    animationFrameId !== null
) {

    cancelAnimationFrame(
        animationFrameId
    );

    animationFrameId =
        null;

}


}

/* =========================================================
BOOT
========================================================= */

function boot() {

console.log(
    "[Cyber Taxi] Booting..."
);


/*
 * Initialize canvas terlebih dahulu.
 */

const canvasReady =
    initializeCanvas();


if (!canvasReady) {

    return;

}


/*
 * Initialize game systems.
 */

if (
    typeof initializeGame ===
    "function"
) {

    initializeGame();

} else {

    console.error(
        "[Cyber Taxi] initializeGame() not found."
    );

    return;

}


/*
 * Start loop.
 */

startLoop();


console.log(
    "[Cyber Taxi] Ready."
);


}

/* =========================================================
DOM READY
========================================================= */

if (
document.readyState ===
"loading"
) {

document.addEventListener(
    "DOMContentLoaded",
    boot,
    {
        once: true
    }
);


} else {

boot();


}

/* =========================================================
PUBLIC DEBUG API
========================================================= */

window.CyberTaxi = {

/*
 * Pause.
 */

pause:
    function () {

        if (
            typeof pauseGame ===
            "function"
        ) {

            pauseGame();

            return;

        }


        if (
            typeof pauseGameState ===
            "function"
        ) {

            pauseGameState();

        }

    },


/*
 * Resume.
 */

resume:
    function () {

        if (
            typeof resumeGame ===
            "function"
        ) {

            resumeGame();

            return;

        }


        if (
            typeof resumeGameState ===
            "function"
        ) {

            resumeGameState();

        }

    },


/*
 * Restart.
 */

restart:
    function () {

        if (
            typeof startGame ===
            "function"
        ) {

            startGame();

        }

    },


/*
 * Get current state.
 */

getState:
    function () {

        if (
            typeof gameState !==
            "undefined"
        ) {

            return gameState;

        }


        return null;

    },


/*
 * Get canvas.
 */

getCanvas:
    function () {

        return canvas;

    }


};

/* =========================================================
DEBUG GLOBALS

Berguna ketika debugging dari browser console.

Contoh:

CyberTaxi.canvas
CyberTaxi.ctx
========================================================= */

Object.defineProperty(
window.CyberTaxi,
"canvas",
{
get:
function () {

            return canvas;

        }
}


);

Object.defineProperty(
window.CyberTaxi,
"ctx",
{
get:
function () {

            return ctx;

        }
}


);

})();
