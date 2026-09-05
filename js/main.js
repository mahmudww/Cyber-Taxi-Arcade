import {
    startGame,
    movePlayer,
    resizeCanvas
} from "./game.js";


/* ========================================
   MAKE FUNCTIONS AVAILABLE TO HTML
   ======================================== */

window.startGame = startGame;
window.movePlayer = movePlayer;


/* ========================================
   INITIALIZE
   ======================================== */

resizeCanvas();


/* ========================================
   KEYBOARD
   ======================================== */

window.addEventListener("keydown", (event) => {

    const key = event.key.toLowerCase();

    if (key === "arrowleft" || key === "a") {
        movePlayer(-1);
    }

    if (key === "arrowright" || key === "d") {
        movePlayer(1);
    }

});


/* ========================================
   RESIZE
   ======================================== */

window.addEventListener("resize", () => {
    resizeCanvas();
});
