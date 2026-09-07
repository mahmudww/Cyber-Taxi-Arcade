/* =========================================================
CYBER TAXI
MAIN / BOOTSTRAP

main.js hanya bertugas untuk:

Menunggu DOM siap
Menjalankan initialization
Menjalankan game loop
Menjaga delta time tetap stabil

Gameplay → game.js
Rendering → renderer.js
UI → ui.js

========================================================= */

(function () {

"use strict";


/* =====================================================
   GAME LOOP VARIABLES
   ===================================================== */

let lastTime = 0;

let animationFrameId = null;


/*
 * Delta time dibatasi supaya game tidak
 * "lompat" terlalu jauh ketika tab/browser
 * sempat freeze atau masuk background.
 */

const MAX_DELTA_TIME = 0.05;


/* =====================================================
   GAME LOOP
   ===================================================== */

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
        (timestamp - lastTime) /
        1000;


    lastTime =
        timestamp;


    /*
     * Prevent huge jumps.
     */

    dt =
        Math.min(
            dt,
            MAX_DELTA_TIME
        );


    /*
     * Gameplay update.

     */

    if (
        typeof updateGame ===
        "function"
    ) {

        updateGame(
            dt
        );

    }


    /*
     * Renderer.

     */

    if (
        typeof renderGame ===
        "function"
    ) {

        renderGame(
            dt
        );

    } else if (
        typeof draw ===
        "function"
    ) {

        /*
         * Compatibility dengan renderer
         * versi sebelumnya.

         */

        draw();

    }


    /*
     * Continue loop.

     */

    animationFrameId =
        requestAnimationFrame(
            gameLoop
        );

}


/* =====================================================
   START LOOP
   ===================================================== */

function startLoop() {

    /*
     * Prevent duplicate loops.
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


/* =====================================================
   BOOT
   ===================================================== */

function boot() {

    console.log(
        "[Cyber Taxi] Booting..."
    );


    /*
     * Initialize seluruh sistem.

     * game.js yang menjadi coordinator.

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
     * Start rendering/game loop.

     */

    startLoop();


    console.log(
        "[Cyber Taxi] Ready."
    );

}


/* =====================================================
   DOM READY
   ===================================================== */

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


/* =====================================================
   PUBLIC DEBUG API
   =====================================================

   Bisa dipakai dari browser console.

   Contoh:

   CyberTaxi.pause()
   CyberTaxi.resume()

   ===================================================== */

window.CyberTaxi = {

    pause:
        function () {

            if (
                typeof togglePause ===
                "function"
            ) {

                if (
                    typeof gameplay !==
                    "undefined" &&
                    !gameplay.paused
                ) {

                    togglePause();

                }

            }

        },


    resume:
        function () {

            if (
                typeof togglePause ===
                "function"
            ) {

                if (
                    typeof gameplay !==
                    "undefined" &&
                    gameplay.paused
                ) {

                    togglePause();

                }

            }

        },


    restart:
        function () {

            if (
                typeof startGame ===
                "function"
            ) {

                startGame();

            }

        },


    getState:
        function () {

            if (
                typeof gameplay !==
                "undefined"
            ) {

                return {
                    ...gameplay
                };

            }

            return null;

        }

};


})();
