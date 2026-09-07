/* =========================================================
CYBER TAXI
INPUT SYSTEM

Menangani semua input pemain:

DESKTOP

Arrow Left
Arrow Right
A
D
Space / P untuk pause

MOBILE

Tombol LEFT / RIGHT
Swipe kiri / kanan

Prinsip:
INPUT -> COMMAND

File ini TIDAK mengurus:

movement physics
collision
rendering
score
audio secara langsung

Semua itu ditangani sistem masing-masing.
========================================================= */

/* =========================================================
INPUT STATE
========================================================= */

const inputState = {

leftPressed: false,

rightPressed: false,

pausePressed: false,

touchStartX: 0,

touchStartY: 0,

touchCurrentX: 0,

touchCurrentY: 0,

isTouching: false,

lastInputTime: 0


};

/* =========================================================
INPUT CONFIG
========================================================= */

const INPUT_CONFIG = {

swipeThreshold: 35,

swipeVerticalTolerance: 80,

keyRepeatDelay: 120,

preventBrowserGestures: true


};

/* =========================================================
INITIALIZE INPUT
========================================================= */

function initInput() {

setupKeyboardInput();

setupTouchInput();

setupControlButtons();

setupBrowserGestureProtection();


}

/* =========================================================
KEYBOARD INPUT
========================================================= */

function setupKeyboardInput() {

window.addEventListener(
    "keydown",
    handleKeyDown,
    { passive: false }
);


window.addEventListener(
    "keyup",
    handleKeyUp,
    { passive: false }
);


}

/* =========================================================
KEY DOWN
========================================================= */

function handleKeyDown(event) {

const key =
    event.key.toLowerCase();


/* -----------------------------------------------------
   LEFT
   ----------------------------------------------------- */

if (
    key === "arrowleft" ||
    key === "a"
) {

    event.preventDefault();


    /*
     * Jangan mengulang lane movement ketika
     * keyboard key ditahan.
     */

    if (event.repeat) {

        return;

    }


    inputState.leftPressed = true;

    triggerPlayerMove(-1);

    return;

}


/* -----------------------------------------------------
   RIGHT
   ----------------------------------------------------- */

if (
    key === "arrowright" ||
    key === "d"
) {

    event.preventDefault();


    if (event.repeat) {

        return;

    }


    inputState.rightPressed = true;

    triggerPlayerMove(1);

    return;

}


/* -----------------------------------------------------
   PAUSE
   ----------------------------------------------------- */

if (
    key === " " ||
    key === "p" ||
    key === "escape"
) {

    event.preventDefault();


    if (event.repeat) {

        return;

    }


    inputState.pausePressed = true;

    triggerPause();

}


}

/* =========================================================
KEY UP
========================================================= */

function handleKeyUp(event) {

const key =
    event.key.toLowerCase();


if (
    key === "arrowleft" ||
    key === "a"
) {

    inputState.leftPressed = false;

}


if (
    key === "arrowright" ||
    key === "d"
) {

    inputState.rightPressed = false;

}


if (
    key === " " ||
    key === "p" ||
    key === "escape"
) {

    inputState.pausePressed = false;

}


}

/* =========================================================
PLAYER MOVE COMMAND
========================================================= */

function triggerPlayerMove(direction) {

if (!gameState.isPlaying) {

    return;

}


if (gameState.isPaused) {

    return;

}


const now =
    performance.now();


/*
 * Sedikit debounce untuk touch / mouse / keyboard
 * yang bisa mengirim input ganda secara tidak sengaja.
 */

if (
    now -
    inputState.lastInputTime <
    INPUT_CONFIG.keyRepeatDelay
) {

    return;

}


inputState.lastInputTime =
    now;


movePlayerState(
    direction,
    canvas
);


playMoveSound();


}

/* =========================================================
PAUSE COMMAND
========================================================= */

function triggerPause() {

if (!gameState.isPlaying) {

    return;

}


togglePauseState();

playPauseSound();


/*
 * UI akan membaca gameState.isPaused
 * dan menampilkan pause screen.
 */

if (
    typeof updatePauseUI ===
    "function"
) {

    updatePauseUI();

}


}

/* =========================================================
TOUCH INPUT
========================================================= */

function setupTouchInput() {

/*
 * Touch events dipasang ke canvas/game area,
 * bukan seluruh document.
 */

canvas.addEventListener(

    "touchstart",

    handleTouchStart,

    { passive: false }

);


canvas.addEventListener(

    "touchmove",

    handleTouchMove,

    { passive: false }

);


canvas.addEventListener(

    "touchend",

    handleTouchEnd,

    { passive: false }

);


canvas.addEventListener(

    "touchcancel",

    handleTouchCancel,

    { passive: false }

);


}

/* =========================================================
TOUCH START
========================================================= */

function handleTouchStart(event) {

if (!event.touches.length) {

    return;

}


event.preventDefault();


const touch =
    event.touches[0];


inputState.isTouching = true;


inputState.touchStartX =
    touch.clientX;


inputState.touchStartY =
    touch.clientY;


inputState.touchCurrentX =
    touch.clientX;


inputState.touchCurrentY =
    touch.clientY;


}

/* =========================================================
TOUCH MOVE
========================================================= */

function handleTouchMove(event) {

if (!inputState.isTouching) {

    return;

}


event.preventDefault();


if (!event.touches.length) {

    return;

}


const touch =
    event.touches[0];


inputState.touchCurrentX =
    touch.clientX;


inputState.touchCurrentY =
    touch.clientY;


}

/* =========================================================
TOUCH END
========================================================= */

function handleTouchEnd(event) {

if (!inputState.isTouching) {

    return;

}


event.preventDefault();


const deltaX =
    inputState.touchCurrentX -
    inputState.touchStartX;


const deltaY =
    inputState.touchCurrentY -
    inputState.touchStartY;


const absoluteX =
    Math.abs(deltaX);


const absoluteY =
    Math.abs(deltaY);


inputState.isTouching = false;


/*
 * Swipe harus cukup horizontal.
 *
 * Ini mencegah swipe vertikal / scroll
 * dianggap sebagai perpindahan lane.
 */

if (
    absoluteX <
    INPUT_CONFIG.swipeThreshold
) {

    return;

}


if (
    absoluteY >
    INPUT_CONFIG.swipeVerticalTolerance
) {

    return;

}


if (deltaX < 0) {

    triggerPlayerMove(-1);

} else {

    triggerPlayerMove(1);

}


}

/* =========================================================
TOUCH CANCEL
========================================================= */

function handleTouchCancel() {

inputState.isTouching = false;

inputState.touchStartX = 0;

inputState.touchStartY = 0;

inputState.touchCurrentX = 0;

inputState.touchCurrentY = 0;


}

/* =========================================================
MOBILE CONTROL BUTTONS

Mendukung tombol yang sudah ada di HTML.

Contoh:

<button data-control="left"> <button data-control="right">

Kalau HTML lama masih memakai onclick,
kita juga tetap bisa bekerja bersamanya.
========================================================= */

function setupControlButtons() {

const leftButton =
    document.querySelector(
        '[data-control="left"]'
    );


const rightButton =
    document.querySelector(
        '[data-control="right"]'
    );


if (leftButton) {

    setupControlButton(
        leftButton,
        -1
    );

}


if (rightButton) {

    setupControlButton(
        rightButton,
        1
    );

}


/*
 * Fallback untuk HTML lama.
 *
 * Kalau tombol belum punya data-control,
 * kita cari .control-btn berdasarkan urutan.
 */

if (
    !leftButton ||
    !rightButton
) {

    const buttons =
        document.querySelectorAll(
            ".control-btn"
        );


    if (buttons.length >= 2) {

        setupControlButton(
            buttons[0],
            -1
        );


        setupControlButton(
            buttons[1],
            1
        );

    }

}


}

/* =========================================================
SETUP INDIVIDUAL CONTROL BUTTON
========================================================= */

function setupControlButton(
button,
direction
) {

/*
 * Pointer Events bekerja untuk:
 * - mouse
 * - touch
 * - stylus
 */

button.addEventListener(

    "pointerdown",

    function(event) {

        event.preventDefault();

        triggerPlayerMove(direction);

    },

    { passive: false }

);


/*
 * Mencegah long press browser,
 * context menu, dan drag behavior.
 */

button.addEventListener(

    "contextmenu",

    function(event) {

        event.preventDefault();

    }

);


button.addEventListener(

    "dragstart",

    function(event) {

        event.preventDefault();

    }

);


}

/* =========================================================
BROWSER GESTURE PROTECTION
========================================================= */

function setupBrowserGestureProtection() {

if (
    !INPUT_CONFIG.preventBrowserGestures
) {

    return;

}


/*
 * Mencegah double tap zoom pada area game.
 */

canvas.addEventListener(

    "dblclick",

    function(event) {

        event.preventDefault();

    }

);


/*
 * Mencegah drag canvas.
 */

canvas.addEventListener(

    "dragstart",

    function(event) {

        event.preventDefault();

    }

);


/*
 * Mencegah context menu pada game.
 */

canvas.addEventListener(

    "contextmenu",

    function(event) {

        event.preventDefault();

    }

);


}

/* =========================================================
INPUT RESET
========================================================= */

function resetInputState() {

inputState.leftPressed = false;

inputState.rightPressed = false;

inputState.pausePressed = false;

inputState.touchStartX = 0;

inputState.touchStartY = 0;

inputState.touchCurrentX = 0;

inputState.touchCurrentY = 0;

inputState.isTouching = false;

inputState.lastInputTime = 0;


}

/* =========================================================
ENABLE / DISABLE INPUT
========================================================= */

function setInputEnabled(enabled) {

/*
 * Untuk sekarang kita menggunakan gameState sebagai
 * gate utama sehingga event listener tidak perlu
 * dilepas-pasang setiap kali pause.
 */

if (!enabled) {

    resetInputState();

}


}

/* =========================================================
CLEANUP
========================================================= */

function destroyInput() {

resetInputState();


}
