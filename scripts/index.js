
let Player = SynthPlayer;

WebMidi.enable()
    .then(onEnabled);
    

function onEnabled() {
    midiList = document.getElementById("midi-devices");

    WebMidi.outputs.forEach((output, index) => {
        const item = document.createElement("li");
        item.innerHTML = `[${index}] ${output.name}`;
        midiList.appendChild(item);
    });

}

var score = null;

window.onload = () => {
    updateSettingsTextarea();
    
    score = new Score();

    const midiList = document.getElementById("midi-devices");
    const item = document.createElement("li");
    item.innerHTML = `[Synth] Tone.js Synth`;
    midiList.appendChild(item);

}

async function start() {
    await Tone.start();
    
    // TODO: if already running, reload / cancel / deny
    loadSettings();

    if (typeof settings.activeOutputIndex == "number") {
        Player = MidiPlayer
    } else if (settings.activeOutputIndex == 'Synth') {
        Player = SynthPlayer
    } else {
        alert("Invalid MIDI device index (should be a number or 'Synth' for web synth).")
    }

    const player = new Player();
    
    score.clear();
    score.renderClef();

    const main = new Main(score, player);
    main.runUI();

    main.queueIntroSticks();
    for (let i = 0; i < settings.amountOfFigures; i++) {
        main.queueMeasure();
    }

    main.queueEndEvent();

    Tone.Transport.start();

    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
}
