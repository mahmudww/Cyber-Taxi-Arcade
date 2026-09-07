/* =========================================================
CYBER TAXI
AUDIO SYSTEM
Sistem audio procedural menggunakan Web Audio API.

Tidak membutuhkan file .mp3 / .wav.

Audio dibuat langsung oleh browser menggunakan oscillator,
filter, dan gain node.

Audio system bertanggung jawab untuk:

engine
background music
movement
power-up
shield
near miss
crash
UI feedback
========================================================= */
/* =========================================================
AUDIO STATE
========================================================= */

const audioState = {

context: null,

masterGain: null,

musicGain: null,

sfxGain: null,

engineGain: null,

engineOscillator: null,

engineFilter: null,

musicInterval: null,

musicStep: 0,

initialized: false,

muted: false

};

/* =========================================================
MUSIC
========================================================= */

const MUSIC_NOTES = [

110.00,
130.81,
146.83,
164.81,
196.00,
220.00,
196.00,
164.81

];

/* =========================================================
INITIALIZE AUDIO
========================================================= */

function initAudio() {

if (!GAME_CONFIG.AUDIO.enabled) {

    return;

}

try {

    if (!audioState.context) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {

            console.warn(
                "Web Audio API is not supported."
            );

            return;

        }

        audioState.context =
            new AudioContext();

        /* -------------------------------------------------
           MASTER
           ------------------------------------------------- */

        audioState.masterGain =
            audioState.context.createGain();

        audioState.masterGain.gain.value =
            0.8;

        /* -------------------------------------------------
           MUSIC
           ------------------------------------------------- */

        audioState.musicGain =
            audioState.context.createGain();

        audioState.musicGain.gain.value =
            GAME_CONFIG.AUDIO.musicVolume;

        /* -------------------------------------------------
           SFX
           ------------------------------------------------- */

        audioState.sfxGain =
            audioState.context.createGain();

        audioState.sfxGain.gain.value =
            GAME_CONFIG.AUDIO.soundVolume;

        audioState.musicGain.connect(
            audioState.masterGain
        );

        audioState.sfxGain.connect(
            audioState.masterGain
        );

        audioState.masterGain.connect(
            audioState.context.destination
        );

        audioState.initialized = true;

    }

    if (
        audioState.context.state ===
        "suspended"
    ) {

        audioState.context.resume();

    }

    startEngineAudio();

    startMusic();

} catch (error) {

    console.warn(
        "Audio initialization failed.",
        error
    );

}

}

/* =========================================================
MASTER VOLUME
========================================================= */

function setMasterVolume(volume) {

if (!audioState.masterGain) return;

const safeVolume =
    clamp(volume, 0, 1);

audioState.masterGain.gain.setTargetAtTime(

    safeVolume,

    audioState.context.currentTime,

    0.03

);

}

/* =========================================================
MUTE
========================================================= */

function toggleMute() {

audioState.muted =
    !audioState.muted;

if (!audioState.masterGain) {

    return audioState.muted;

}

const volume =
    audioState.muted ? 0 : 0.8;

audioState.masterGain.gain.setTargetAtTime(

    volume,

    audioState.context.currentTime,

    0.03

);

return audioState.muted;

}

/* =========================================================
ENGINE AUDIO
========================================================= */

function startEngineAudio() {

if (!audioState.context) return;

if (audioState.engineOscillator) return;

try {

    const ctx =
        audioState.context;

    const oscillator =
        ctx.createOscillator();

    const filter =
        ctx.createBiquadFilter();

    const gain =
        ctx.createGain();

    oscillator.type =
        "sawtooth";

    oscillator.frequency.setValueAtTime(

        GAME_CONFIG.AUDIO.engineFrequency,

        ctx.currentTime

    );

    filter.type =
        "lowpass";

    filter.frequency.setValueAtTime(

        160,

        ctx.currentTime

    );

    gain.gain.setValueAtTime(

        0.0001,

        ctx.currentTime

    );

    oscillator.connect(filter);

    filter.connect(gain);

    gain.connect(audioState.sfxGain);

    oscillator.start();

    audioState.engineOscillator =
        oscillator;

    audioState.engineFilter =
        filter;

    audioState.engineGain =
        gain;

    gain.gain.exponentialRampToValueAtTime(

        GAME_CONFIG.AUDIO.engineVolume,

        ctx.currentTime + 0.25

    );

} catch (error) {

    console.warn(
        "Unable to start engine audio.",
        error
    );

}

}

/* =========================================================
ENGINE UPDATE
Engine pitch berubah berdasarkan kecepatan.

Semakin cepat taxi:
semakin tinggi pitch engine.
========================================================= */

function updateEngineAudio() {

if (!audioState.context) return;

if (!audioState.engineOscillator) return;

if (!gameState.isPlaying) return;

const ctx =
    audioState.context;

const speed =
    gameState.currentSpeed;

const normalizedSpeed =
    clamp(
        speed /
        GAME_CONFIG.SPEED.maximumSpeed,
        0,
        1
    );

const frequency =
    55 +
    normalizedSpeed * 95;

const filterFrequency =
    130 +
    normalizedSpeed * 220;

audioState.engineOscillator.frequency.setTargetAtTime(

    frequency,

    ctx.currentTime,

    0.04

);

audioState.engineFilter.frequency.setTargetAtTime(

    filterFrequency,

    ctx.currentTime,

    0.05

);

}

/* =========================================================
ENGINE BOOST
========================================================= */

function boostEngineAudio() {

if (!audioState.context) return;

if (!audioState.engineGain) return;

const ctx =
    audioState.context;

audioState.engineGain.gain.cancelScheduledValues(

    ctx.currentTime

);

audioState.engineGain.gain.setTargetAtTime(

    GAME_CONFIG.AUDIO.engineVolume * 1.8,

    ctx.currentTime,

    0.04

);

}

/* =========================================================
ENGINE NORMALIZE
========================================================= */

function normalizeEngineAudio() {

if (!audioState.context) return;

if (!audioState.engineGain) return;

const ctx =
    audioState.context;

audioState.engineGain.gain.setTargetAtTime(

    GAME_CONFIG.AUDIO.engineVolume,

    ctx.currentTime,

    0.15

);

}

/* =========================================================
START MUSIC
========================================================= */

function startMusic() {

if (!audioState.context) return;

if (audioState.musicInterval) return;

audioState.musicStep = 0;

audioState.musicInterval =
    setInterval(

        playMusicStep,

        GAME_CONFIG.AUDIO.musicInterval

    );

}

/* =========================================================
MUSIC STEP
========================================================= */

function playMusicStep() {

if (!audioState.context) return;

if (!gameState.isPlaying) return;

if (gameState.isPaused) return;

try {

    const ctx =
        audioState.context;

    const frequency =
        MUSIC_NOTES[
            audioState.musicStep %
            MUSIC_NOTES.length
        ];

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    const filter =
        ctx.createBiquadFilter();

    oscillator.type =
        "triangle";

    oscillator.frequency.setValueAtTime(

        frequency,

        ctx.currentTime

    );

    filter.type =
        "lowpass";

    filter.frequency.setValueAtTime(

        900,

        ctx.currentTime

    );

    gain.gain.setValueAtTime(

        0.0001,

        ctx.currentTime

    );

    gain.gain.exponentialRampToValueAtTime(

        GAME_CONFIG.AUDIO.musicVolume,

        ctx.currentTime + 0.015

    );

    gain.gain.exponentialRampToValueAtTime(

        0.0001,

        ctx.currentTime + 0.21

    );

    oscillator.connect(filter);

    filter.connect(gain);

    gain.connect(audioState.musicGain);

    oscillator.start();

    oscillator.stop(
        ctx.currentTime + 0.22
    );

    audioState.musicStep++;

} catch (error) {

    console.warn(
        "Music step failed.",
        error
    );

}

}

/* =========================================================
STOP AUDIO
========================================================= */

function stopAudio() {

/* -----------------------------------------------------
   ENGINE
   ----------------------------------------------------- */

if (audioState.engineOscillator) {

    try {

        audioState.engineOscillator.stop();

    } catch (error) {}

    try {

        audioState.engineOscillator.disconnect();

    } catch (error) {}

    audioState.engineOscillator =
        null;

}

audioState.engineGain =
    null;

audioState.engineFilter =
    null;

/* -----------------------------------------------------
   MUSIC
   ----------------------------------------------------- */

if (audioState.musicInterval) {

    clearInterval(
        audioState.musicInterval
    );

    audioState.musicInterval =
        null;

}

}

/* =========================================================
GENERIC SOUND
========================================================= */

function playTone({

frequency = 440,

endFrequency = frequency,

duration = 0.1,

volume = 0.08,

type = "sine",

attack = 0.01,

release = 0.08

} = {}) {

if (!audioState.context) return;

try {

    const ctx =
        audioState.context;

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    oscillator.type =
        type;

    oscillator.frequency.setValueAtTime(

        frequency,

        ctx.currentTime

    );

    if (
        endFrequency !==
        frequency
    ) {

        oscillator.frequency.exponentialRampToValueAtTime(

            Math.max(
                1,
                endFrequency
            ),

            ctx.currentTime +
            duration

        );

    }

    gain.gain.setValueAtTime(

        0.0001,

        ctx.currentTime

    );

    gain.gain.exponentialRampToValueAtTime(

        volume,

        ctx.currentTime +
        attack

    );

    gain.gain.exponentialRampToValueAtTime(

        0.0001,

        ctx.currentTime +
        Math.max(
            attack + 0.01,
            duration - release
        )

    );

    oscillator.connect(gain);

    gain.connect(audioState.sfxGain);

    oscillator.start();

    oscillator.stop(

        ctx.currentTime +
        duration +
        0.02

    );

} catch (error) {

    console.warn(
        "Unable to play tone.",
        error
    );

}

}

/* =========================================================
MOVEMENT SOUND
========================================================= */

function playMoveSound() {

playTone({

    frequency: 240,

    endFrequency: 480,

    duration: 0.08,

    volume: 0.055,

    type: "sine",

    attack: 0.005,

    release: 0.04

});

}

/* =========================================================
POWERUP SOUND
========================================================= */

function playPowerupSound() {

playTone({

    frequency: 350,

    endFrequency: 950,

    duration: 0.18,

    volume: 0.11,

    type: "triangle",

    attack: 0.01,

    release: 0.06

});

setTimeout(() => {

    playTone({

        frequency: 700,

        endFrequency: 1100,

        duration: 0.12,

        volume: 0.07,

        type: "sine",

        attack: 0.005,

        release: 0.05

    });

}, 80);

}

/* =========================================================
SHIELD BREAK SOUND
========================================================= */

function playShieldBreakSound() {

playTone({

    frequency: 220,

    endFrequency: 55,

    duration: 0.32,

    volume: 0.14,

    type: "sawtooth",

    attack: 0.005,

    release: 0.12

});

setTimeout(() => {

    playTone({

        frequency: 90,

        endFrequency: 40,

        duration: 0.18,

        volume: 0.07,

        type: "square",

        attack: 0.005,

        release: 0.08

    });

}, 50);

boostEngineAudio();

}

/* =========================================================
NEAR MISS SOUND
========================================================= */

function playNearMissSound() {

playTone({

    frequency: 420,

    endFrequency: 720,

    duration: 0.11,

    volume: 0.075,

    type: "square",

    attack: 0.005,

    release: 0.05

});

}

/* =========================================================
COMBO SOUND
========================================================= */

function playComboSound(combo) {

const baseFrequency =
    260 +
    Math.min(combo, 20) * 18;

playTone({

    frequency: baseFrequency,

    endFrequency:
        baseFrequency * 1.5,

    duration: 0.1,

    volume: 0.06,

    type: "triangle",

    attack: 0.005,

    release: 0.05

});

}

/* =========================================================
GAME OVER SOUND
========================================================= */

function playGameOverSound() {

playTone({

    frequency: 140,

    endFrequency: 25,

    duration: 0.7,

    volume: 0.18,

    type: "sawtooth",

    attack: 0.01,

    release: 0.2

});

setTimeout(() => {

    playTone({

        frequency: 75,

        endFrequency: 30,

        duration: 0.45,

        volume: 0.1,

        type: "triangle",

        attack: 0.01,

        release: 0.15

    });

}, 160);

normalizeEngineAudio();

}

/* =========================================================
UI SELECT SOUND
========================================================= */

function playSelectSound() {

playTone({

    frequency: 300,

    endFrequency: 420,

    duration: 0.07,

    volume: 0.045,

    type: "sine",

    attack: 0.005,

    release: 0.035

});

}

/* =========================================================
PAUSE SOUND
========================================================= */

function playPauseSound() {

playTone({

    frequency: 180,

    endFrequency: 130,

    duration: 0.09,

    volume: 0.045,

    type: "triangle",

    attack: 0.005,

    release: 0.04

});

}

/* =========================================================
COUNTDOWN BEEP
========================================================= */

function playCountdownSound(isFinal = false) {

playTone({

    frequency:
        isFinal ? 880 : 440,

    endFrequency:
        isFinal ? 880 : 440,

    duration: 0.12,

    volume:
        isFinal ? 0.1 : 0.06,

    type: "square",

    attack: 0.005,

    release: 0.05

});

}

/* =========================================================
PERFECT / MILESTONE SOUND
========================================================= */

function playMilestoneSound() {

playTone({

    frequency: 520,

    endFrequency: 780,

    duration: 0.12,

    volume: 0.07,

    type: "triangle",

    attack: 0.005,

    release: 0.05

});

setTimeout(() => {

    playTone({

        frequency: 780,

        endFrequency: 1040,

        duration: 0.12,

        volume: 0.065,

        type: "triangle",

        attack: 0.005,

        release: 0.05

    });

}, 70);

}

/* =========================================================
AUDIO UPDATE
========================================================= */

function updateAudio() {

if (!audioState.initialized) return;

if (!gameState.isPlaying) return;

if (gameState.isPaused) return;

updateEngineAudio();

}

/* =========================================================
CLEANUP
========================================================= */

function destroyAudio() {

stopAudio();

if (audioState.context) {

    try {

        audioState.context.close();

    } catch (error) {}

}

audioState.context = null;

audioState.masterGain = null;

audioState.musicGain = null;

audioState.sfxGain = null;

audioState.initialized = false;

}
