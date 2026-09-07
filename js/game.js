/* =========================================================
CYBER TAXI
GAMEPLAY SYSTEM
game.js adalah otak gameplay.

Tanggung jawab:

Start / restart
Game loop
Score
Speed progression
Traffic spawning
Collision
Near miss
Combo
Power-up timer
Pause
Game over
High score
Sistem visual → renderer.js
Sistem UI → ui.js
Sistem input → input.js
Player → player.js
Traffic → traffic.js
Powerups → powerups.js

========================================================= */

/* =========================================================
GAME INTERNAL STATE
========================================================= */

const gameplay = {

started:
    false,

paused:
    false,

gameOver:
    false,

score:
    0,

speed:
    1,

worldSpeed:
    4.5,

distance:
    0,

combo:
    0,

comboTimer:
    0,

nearMissCooldown:
    0,

highScore:
    0,

newHighScore:
    false,

elapsed:
    0,

spawnTimer:
    0,

difficulty:
    0

};

/* =========================================================
PUBLIC GAME STATE
Sistem lain boleh membaca object ini.

state.js tetap menjadi sumber state global
jika tersedia.

Kita sinkronkan keduanya supaya modul lama
dan modul baru tetap bisa hidup bersama.

========================================================= */

function syncGameplayState() {

if (
    typeof gameState ===
    "undefined"
) {

    return;

}

gameState.running =
    gameplay.started &&
    !gameplay.paused &&
    !gameplay.gameOver;

gameState.gameOver =
    gameplay.gameOver;

gameState.score =
    gameplay.score;

gameState.speed =
    gameplay.speed;

gameState.worldSpeed =
    gameplay.worldSpeed;

gameState.combo =
    gameplay.combo;

gameState.distance =
    gameplay.distance;

gameState.elapsed =
    gameplay.elapsed;

gameState.difficulty =
    gameplay.difficulty;

gameState.paused =
    gameplay.paused;

gameState.newHighScore =
    gameplay.newHighScore;

}

/* =========================================================
HIGH SCORE
========================================================= */

const HIGH_SCORE_KEY =
"cyberTaxiHighScore";

function loadHighScore() {

try {

    const stored =
        localStorage.getItem(
            HIGH_SCORE_KEY
        );

    gameplay.highScore =
        Number(
            stored || 0
        );

} catch (error) {

    gameplay.highScore =
        0;

}

}

function saveHighScore() {

try {

    localStorage.setItem(
        HIGH_SCORE_KEY,
        String(
            Math.floor(
                gameplay.highScore
            )
        )
    );

} catch (error) {

    /*
     * LocalStorage bisa gagal
     * pada beberapa private browsing mode.

     * Game tetap harus berjalan.

     */

}

}

/* =========================================================
RESET GAMEPLAY
========================================================= */

function resetGameplay() {

gameplay.started =
    false;

gameplay.paused =
    false;

gameplay.gameOver =
    false;

gameplay.score =
    0;

gameplay.speed =
    1;

gameplay.worldSpeed =
    4.5;

gameplay.distance =
    0;

gameplay.combo =
    0;

gameplay.comboTimer =
    0;

gameplay.nearMissCooldown =
    0;

gameplay.elapsed =
    0;

gameplay.spawnTimer =
    0;

gameplay.difficulty =
    0;

gameplay.newHighScore =
    false;

syncGameplayState();

}

/* =========================================================
START GAME
========================================================= */

function startGame() {

/*
 * Reset sistem gameplay.
 */

resetGameplay();

/*
 * Reset player.

 */

if (
    typeof resetPlayer ===
    "function"
) {

    resetPlayer();

}

/*
 * Reset traffic.

 */

if (
    typeof resetTraffic ===
    "function"
) {

    resetTraffic();

}

/*
 * Reset powerups.

 */

if (
    typeof resetPowerups ===
    "function"
) {

    resetPowerups();

}

/*
 * Reset effects.

 */

if (
    typeof resetEffects ===
    "function"
) {

    resetEffects();

}

/*
 * Audio.

 */

if (
    typeof initAudio ===
    "function"
) {

    initAudio();

}

/*
 * Pastikan player berada
 * pada posisi awal.

 */

if (
    typeof updatePlayerPosition ===
    "function"
) {

    updatePlayerPosition();

}

/*
 * Aktifkan game.

 */

gameplay.started =
    true;

gameplay.paused =
    false;

gameplay.gameOver =
    false;

syncGameplayState();

/*
 * UI.

 */

if (
    typeof transitionToGame ===
    "function"
) {

    transitionToGame();

} else if (
    typeof showGameUI ===
    "function"
) {

    showGameUI();

}

/*
 * Feedback.

 */

if (
    typeof showFloatingText ===
    "function"
) {

    showFloatingText(
        "NIGHT SHIFT",
        {

            color:
                "#00ffcc",

            scale:
                1.1

        }
    );

}

/*
 * Start audio engine.

 */

if (
    typeof startEngineSound ===
    "function"
) {

    startEngineSound();

}

}

/* =========================================================
PAUSE
========================================================= */

function togglePause() {

if (
    !gameplay.started ||
    gameplay.gameOver
) {

    return;

}

gameplay.paused =
    !gameplay.paused;

syncGameplayState();

if (
    gameplay.paused
) {

    if (
        typeof showPauseScreen ===
        "function"
    ) {

        showPauseScreen();

    }

    if (
        typeof stopEngineSound ===
        "function"
    ) {

        stopEngineSound();

    }

} else {

    if (
        typeof hidePauseScreen ===
        "function"
    ) {

        hidePauseScreen();

    }

    if (
        typeof startEngineSound ===
        "function"
    ) {

        startEngineSound();

    }

}

}

/* =========================================================
SCORE
========================================================= */

function updateScore(
dt
) {

/*
 * Score berdasarkan waktu + speed.

 * Tujuannya supaya pemain merasa
 * semakin cepat = semakin bernilai.

 */

const speedMultiplier =
    Math.max(
        1,
        gameplay.speed
    );

const scoreGain =
    0.3 *
    speedMultiplier *
    dt;

gameplay.score +=
    scoreGain;

}

/* =========================================================
SPEED PROGRESSION
========================================================= */

function updateDifficulty(
dt
) {

gameplay.elapsed +=
    dt;

/*
 * Difficulty berdasarkan score.

 * Setiap beberapa score,
 * game menjadi sedikit lebih cepat.

 */

gameplay.difficulty =
    Math.min(
        10,
        gameplay.score /
        250
    );

/*
 * World speed.

 * Mulai nyaman,
 * kemudian perlahan semakin cepat.

 */

gameplay.worldSpeed =
    4.5 +
    gameplay.difficulty *
    0.42;

/*
 * Speed display.

 */

gameplay.speed =
    gameplay.worldSpeed /
    4.5;

/*
 * Turbo.

 */

if (
    typeof gameState !==
    "undefined" &&
    gameState.turboActive
) {

    gameplay.speed *=
        1.8;

}

}

/* =========================================================
POWERUP TIMER
========================================================= */

function updatePowerupTimer(
dt
) {

if (
    typeof gameState ===
    "undefined"
) {

    return;

}

if (
    gameState.powerupTimer >
    0
) {

    gameState.powerupTimer -=
        dt;

    if (
        gameState.powerupTimer <=
        0
    ) {

        gameState.powerupTimer =
            0;

        gameState.turboActive =
            false;

        gameState.activePowerup =
            "NORMAL";

        if (
            typeof showFloatingText ===
            "function"
        ) {

            showFloatingText(
                "TURBO END",
                {

                    color:
                        "#8b949e",

                    scale:
                        0.9

                }
            );

        }

    }

}

}

/* =========================================================
COMBO SYSTEM
========================================================= */

function updateCombo(
dt
) {

if (
    gameplay.comboTimer >
    0
) {

    gameplay.comboTimer -=
        dt;

}

/*
 * Combo habis.

 */

if (
    gameplay.comboTimer <=
    0 &&
    gameplay.combo > 0
) {

    gameplay.combo =
        0;

}

syncGameplayState();

}

/* =========================================================
ADD COMBO
========================================================= */

function addCombo() {

gameplay.combo =
    Math.min(
        gameplay.combo + 1,
        99
    );

/*
 * Combo bertahan sekitar 2 detik.

 */

gameplay.comboTimer =
    120;

syncGameplayState();

/*
 * Feedback.

 */

if (
    typeof showCombo ===
    "function"
) {

    showCombo(
        gameplay.combo
    );

}

}

/* =========================================================
NEAR MISS DETECTION
Near miss adalah bagian penting dari feel game.

Pemain tidak hanya menghindar.

Pemain diberi hadiah karena
menghindar SEDEKAT mungkin.

========================================================= */

function checkNearMisses() {

if (
    typeof obstacles ===
    "undefined"
) {

    return;

}

if (
    typeof player ===
    "undefined"
) {

    return;

}

if (
    gameplay.nearMissCooldown >
    0
) {

    return;

}

const lanes =
    typeof getLanes ===
    "function"
        ? getLanes()
        : [];

if (
    !lanes.length
) {

    return;

}

const playerLane =
    typeof playerLane !==
    "undefined"
        ? playerLane
        : 1;

const playerY =
    player.y;

for (
    const obstacle
    of obstacles
) {

    /*
     * Near miss hanya untuk mobil
     * yang melewati area player.

     */

    const verticalDistance =
        Math.abs(
            (
                obstacle.y +
                obstacle.height / 2
            ) -
            (
                playerY +
                player.height / 2
            )
        );

    if (
        verticalDistance >
        70
    ) {

        continue;

    }

    /*
     * Harus berada di lane sebelah.

     */

    const laneDistance =
        Math.abs(
            obstacle.lane -
            playerLane
        );

    if (
        laneDistance !==
        1
    ) {

        continue;

    }

    /*
     * Berikan bonus.

     */

    gameplay.score +=
        25;

    addCombo();

    gameplay.nearMissCooldown =
        18;

    const x =
        lanes[
            obstacle.lane
        ];

    const y =
        playerY;

    if (
        typeof showNearMissFeedback ===
        "function"
    ) {

        showNearMissFeedback(
            x,
            y
        );

    }

    if (
        typeof createParticles ===
        "function"
    ) {

        createParticles(
            x,
            y,
            "#ffb86c",
            10
        );

    }

    if (
        typeof playSound ===
        "function"
    ) {

        playSound(
            "move"
        );

    }

    break;

}

}

/* =========================================================
COLLISION
========================================================= */

function checkPlayerCollision() {

if (
    typeof obstacles ===
    "undefined" ||
    typeof player ===
    "undefined"
) {

    return false;

}

for (
    let i = obstacles.length - 1;
    i >= 0;
    i--
) {

    const obstacle =
        obstacles[i];

    /*
     * Lane collision.

     */

    if (
        obstacle.lane !==
        playerLane
    ) {

        continue;

    }

    /*
     * Vertical collision.

     */

    const playerTop =
        player.y;

    const playerBottom =
        player.y +
        player.height;

    const obstacleTop =
        obstacle.y;

    const obstacleBottom =
        obstacle.y +
        obstacle.height;

    const collision =
        playerBottom >
        obstacleTop &&
        playerTop <
        obstacleBottom;

    if (
        !collision
    ) {

        continue;

    }

    /*
     * Shield.

     */

    if (
        player.shields >
        0
    ) {

        player.shields--;

        obstacles.splice(
            i,
            1
        );

        if (
            typeof playSound ===
            "function"
        ) {

            playSound(
                "shield_break"
            );

        }

        if (
            typeof showShieldBreakFeedback ===
            "function"
        ) {

            showShieldBreakFeedback(
                player.x ||
                0,
                player.y
            );

        }

        if (
            typeof createParticles ===
            "function"
        ) {

            const lanes =
                typeof getLanes ===
                "function"
                    ? getLanes()
                    : [];

            const x =
                lanes[
                    playerLane
                ];

            createParticles(
                x,
                player.y +
                player.height /
                2,
                "#00ffcc",
                20
            );

        }

        return false;

    }

    /*
     * Tidak ada shield.
     */

    return true;

}

return false;

}

/* =========================================================
UPDATE TRAFFIC
========================================================= */

function updateTrafficSystem(
dt
) {

if (
    typeof updateTraffic ===
    "function"
) {

    updateTraffic(
        gameplay.worldSpeed,
        dt
    );

}

}

/* =========================================================
UPDATE PLAYER
========================================================= */

function updatePlayerSystem(
dt
) {

if (
    typeof updatePlayer ===
    "function"
) {

    updatePlayer(
        dt
    );

}

}

/* =========================================================
UPDATE POWERUPS
========================================================= */

function updatePowerupSystem(
dt
) {

if (
    typeof updatePowerups ===
    "function"
) {

    updatePowerups(
        gameplay.worldSpeed,
        dt
    );

}

}

/* =========================================================
UPDATE EFFECTS
========================================================= */

function updateEffectSystem(
dt
) {

if (
    typeof updateEffects ===
    "function"
) {

    updateEffects(
        dt
    );

}

}

/* =========================================================
MAIN GAME UPDATE
========================================================= */

function updateGame(
dt
) {

if (
    !gameplay.started ||
    gameplay.paused ||
    gameplay.gameOver
) {

    return;

}

/*
 * Time.

 */

gameplay.elapsed +=
    dt;

/*
 * Difficulty.

 */

updateDifficulty(
    dt
);

/*
 * Score.

 */

updateScore(
    dt
);

/*
 * Distance.

 */

gameplay.distance +=
    gameplay.worldSpeed *
    dt;

/*
 * Timers.

 */

if (
    gameplay.nearMissCooldown >
    0
) {

    gameplay.nearMissCooldown -=
        dt;

}

updateCombo(
    dt
);

updatePowerupTimer(
    dt
);

/*
 * Systems.

 */

updatePlayerSystem(
    dt
);

updateTrafficSystem(
    dt
);

updatePowerupSystem(
    dt
);

updateEffectSystem(
    dt
);

/*
 * Collision.

 */

if (
    checkPlayerCollision()
) {

    gameOver();

    return;

}

/*
 * Near miss.

 */

checkNearMisses();

/*
 * Sync.

 */

syncGameplayState();

/*
 * UI.

 */

if (
    typeof updateHUD ===
    "function"
) {

    updateHUD();

}

}

/* =========================================================
GAME OVER
========================================================= */

function gameOver() {

if (
    gameplay.gameOver
) {

    return;

}

gameplay.gameOver =
    true;

gameplay.started =
    false;

gameplay.paused =
    false;

/*
 * Score final.

 */

const finalScore =
    Math.floor(
        gameplay.score
    );

/*
 * High score.

 */

gameplay.newHighScore =
    finalScore >
    gameplay.highScore;

if (
    gameplay.newHighScore
) {

    gameplay.highScore =
        finalScore;

    saveHighScore();

}

syncGameplayState();

/*
 * Audio.

 */

if (
    typeof stopEngineSound ===
    "function"
) {

    stopEngineSound();

}

if (
    typeof playSound ===
    "function"
) {

    playSound(
        "gameover"
    );

}

/*
 * Effects.

 */

if (
    typeof triggerGameOverEffect ===
    "function"
) {

    triggerGameOverEffect();

}

/*
 * Particles.

 */

if (
    typeof createParticles ===
    "function" &&
    typeof player !==
    "undefined"
) {

    const lanes =
        typeof getLanes ===
        "function"
            ? getLanes()
            : [];

    const x =
        lanes[
            playerLane
        ];

    createParticles(
        x,
        player.y +
        player.height /
        2,
        "#ff007f",
        30
    );

}

/*
 * UI.

 */

if (
    typeof transitionToGameOver ===
    "function"
) {

    transitionToGameOver(

        finalScore,

        gameplay.highScore,

        gameplay.newHighScore

    );

} else if (
    typeof showGameOverUI ===
    "function"
) {

    showGameOverUI(

        finalScore,

        gameplay.highScore,

        gameplay.newHighScore

    );

}

}

/* =========================================================
GAME LOOP COMPATIBILITY
main.js nantinya boleh menggunakan loop-nya sendiri.

Tapi kita juga menyediakan updateGame()
sebagai API utama gameplay.

========================================================= */

/* =========================================================
INITIALIZATION
========================================================= */

function initializeGame() {

loadHighScore();

resetGameplay();

/*
 * Initialize player.

 */

if (
    typeof initializePlayer ===
    "function"
) {

    initializePlayer();

}

/*
 * Initialize traffic.

 */

if (
    typeof initializeTraffic ===
    "function"
) {

    initializeTraffic();

}

/*
 * Initialize powerups.

 */

if (
    typeof initializePowerups ===
    "function"
) {

    initializePowerups();

}

/*
 * Initialize effects.

 */

if (
    typeof initializeEffects ===
    "function"
) {

    initializeEffects();

}

/*
 * UI.

 */

if (
    typeof initializeUI ===
    "function"
) {

    initializeUI();

}

/*
 * Renderer.

 */

if (
    typeof initializeRenderer ===
    "function"
) {

    initializeRenderer();

}

/*
 * Loading.

 */

if (
    typeof runLoadingSequence ===
    "function"
) {

    runLoadingSequence();

} else if (
    typeof finishLoading ===
    "function"
) {

    finishLoading();

}

syncGameplayState();

}

/* =========================================================
KEYBOARD PAUSE
========================================================= */

window.addEventListener(
"keydown",
(event) => {

    /*
     * Escape untuk pause.

     */

    if (
        event.key ===
        "Escape"
    ) {

        event.preventDefault();

        togglePause();

    }

}

);

/* =========================================================
INITIALIZE
========================================================= */

loadHighScore();
