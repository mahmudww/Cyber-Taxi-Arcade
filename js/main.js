import {
    startGame,
    movePlayer,
    resizeCanvas
} from "./game.js";


/* ========================================
   GET BUTTONS
   ======================================== */

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


/* ========================================
   START / RESTART
   ======================================== */

if (startButton) {
    startButton.addEventListener(
        "click",
        startGame
    );
}


if (restartButton) {
    restartButton.addEventListener(
        "click",
        startGame
    );
}


/* ========================================
   MOBILE CONTROLS
   ======================================== */

if (leftButton) {
    leftButton.addEventListener(
        "click",
        () => movePlayer(-1)
    );
}


if (rightButton) {
    rightButton.addEventListener(
        "click",
        () => movePlayer(1)
    );
}


/* ========================================
   KEYBOARD CONTROLS
   ======================================== */

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            movePlayer(-1);
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {
            movePlayer(1);
        }

    }
);


/* ========================================
   RESIZE
   ======================================== */

resizeCanvas();


window.addEventListener(
    "resize",
    resizeCanvas
);
