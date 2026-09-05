let audioCtx = null;

let engineOsc = null;
let engineGain = null;

let bgmInterval = null;


/* ========================================
   INITIALIZE AUDIO
   ======================================== */

function initAudio() {

    try {

        if (!audioCtx) {

            audioCtx = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        }


        if (
            audioCtx.state === "suspended"
        ) {

            audioCtx.resume();

        }


        startEngineSound();
        startBGM();

    }
    catch (error) {

        console.log(
            "Audio initialization error:",
            error
        );

    }

}


/* ========================================
   ENGINE SOUND
   ======================================== */

function startEngineSound() {

    if (
        engineOsc ||
        !audioCtx
    ) {
        return;
    }


    try {

        engineOsc =
            audioCtx.createOscillator();

        engineGain =
            audioCtx.createGain();


        const filter =
            audioCtx.createBiquadFilter();


        engineOsc.type =
            "sawtooth";


        engineOsc.frequency.setValueAtTime(
            55,
            audioCtx.currentTime
        );


        filter.type =
            "lowpass";


        filter.frequency.setValueAtTime(
            150,
            audioCtx.currentTime
        );


        engineGain.gain.setValueAtTime(
            0.015,
            audioCtx.currentTime
        );


        engineOsc.connect(filter);

        filter.connect(engineGain);

        engineGain.connect(
            audioCtx.destination
        );


        engineOsc.start();

    }
    catch (error) {

        console.log(
            "Engine audio error:",
            error
        );

        engineOsc = null;
        engineGain = null;

    }

}


/* ========================================
   STOP ENGINE
   ======================================== */

function stopEngineSound() {

    if (engineOsc) {

        try {

            engineOsc.stop();

            engineOsc.disconnect();

        }
        catch (error) {

            // Already stopped.

        }

        engineOsc = null;

    }


    engineGain = null;

}


/* ========================================
   BACKGROUND MUSIC
   ======================================== */

function startBGM() {

    if (
        bgmInterval ||
        !audioCtx
    ) {
        return;
    }


    const notes = [
        110,
        130.81,
        146.83,
        164.81,
        196,
        220
    ];


    let step = 0;


    bgmInterval = setInterval(() => {

        if (!audioCtx) {
            return;
        }


        try {

            const osc =
                audioCtx.createOscillator();

            const gain =
                audioCtx.createGain();


            osc.type =
                "triangle";


            osc.frequency.setValueAtTime(
                notes[
                    step % notes.length
                ],
                audioCtx.currentTime
            );


            gain.gain.setValueAtTime(
                0.03,
                audioCtx.currentTime
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioCtx.currentTime + 0.2
            );


            osc.connect(gain);

            gain.connect(
                audioCtx.destination
            );


            osc.start();

            osc.stop(
                audioCtx.currentTime + 0.2
            );


            step++;

        }
        catch (error) {

            console.log(
                "BGM error:",
                error
            );

        }

    }, 250);

}


/* ========================================
   STOP BGM
   ======================================== */

function stopBGM() {

    if (bgmInterval) {

        clearInterval(
            bgmInterval
        );

        bgmInterval = null;

    }

}


/* ========================================
   SOUND EFFECTS
   ======================================== */

function playSound(type) {

    if (!audioCtx) {
        return;
    }


    try {

        const osc =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();


        osc.connect(gain);

        gain.connect(
            audioCtx.destination
        );


        const now =
            audioCtx.currentTime;


        /* MOVE */

        if (type === "move") {

            osc.type =
                "sine";


            osc.frequency.setValueAtTime(
                240,
                now
            );


            osc.frequency.exponentialRampToValueAtTime(
                480,
                now + 0.08
            );


            gain.gain.setValueAtTime(
                0.08,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.08
            );


            osc.start(now);

            osc.stop(
                now + 0.08
            );

        }


        /* POWER-UP */

        else if (
            type === "powerup"
        ) {

            osc.type =
                "triangle";


            osc.frequency.setValueAtTime(
                350,
                now
            );


            osc.frequency.exponentialRampToValueAtTime(
                950,
                now + 0.15
            );


            gain.gain.setValueAtTime(
                0.12,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.15
            );


            osc.start(now);

            osc.stop(
                now + 0.15
            );

        }


        /* SHIELD */

        else if (
            type === "shield_break"
        ) {

            osc.type =
                "sawtooth";


            osc.frequency.setValueAtTime(
                220,
                now
            );


            osc.frequency.linearRampToValueAtTime(
                60,
                now + 0.3
            );


            gain.gain.setValueAtTime(
                0.15,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.3
            );


            osc.start(now);

            osc.stop(
                now + 0.3
            );

        }


        /* GAME OVER */

        else if (
            type === "gameover"
        ) {

            osc.type =
                "sawtooth";


            osc.frequency.setValueAtTime(
                140,
                now
            );


            osc.frequency.linearRampToValueAtTime(
                25,
                now + 0.6
            );


            gain.gain.setValueAtTime(
                0.2,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.6
            );


            osc.start(now);

            osc.stop(
                now + 0.6
            );

        }

    }
    catch (error) {

        console.log(
            "Sound effect error:",
            error
        );

    }

}


/* ========================================
   EXPORTS
   ======================================== */

export {

    initAudio,

    startEngineSound,

    stopEngineSound,

    startBGM,

    stopBGM,

    playSound

};
