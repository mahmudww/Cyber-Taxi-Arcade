/* ========================================
   CYBER TAXI — MAIN
   ======================================== */

import {
    startGame,
    movePlayer,
    resizeCanvas
} from "./game.js";


/* ========================================
   INITIALIZE
   ======================================== */

resizeCanvas();


/* ========================================
   BUTTON CONTROLS
   ======================================== */

window.movePlayer = movePlayer;

window.startGame = startGame;


/* ========================================
   KEYBOARD CONTROLS
   ======================================== */

window.addEventListener("keydown", (event) => {

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {
        movePlayer(-1);
    }


    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {
        movePlayer(1);
    }

});


/* ========================================
   RESIZE
   ======================================== */

window.addEventListener(
    "resize",
    resizeCanvas
);
