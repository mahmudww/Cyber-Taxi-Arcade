import {
    startGame,
    movePlayer,
    resizeCanvas
} from "./game.js";

resizeCanvas();

window.movePlayer = movePlayer;
window.startGame = startGame;

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

window.addEventListener(
    "resize",
    resizeCanvas
);
