
let Player = SynthPlayer;

WebMidi.enable()
    .then(onMidiEnabled, onMidiRejected);

function onMidiEnabled() {
    midiList = document.getElementById("midi-devices");

    WebMidi.outputs.forEach((output, index) => {
        const item = document.createElement("li");
        item.innerHTML = `${output.name}`;
        midiList.appendChild(item);
        settingsLayout.activeOutputName.push(item.innerHTML)
    });

    renderSettings(settingsLayout);
    updateSettings();
}

function onMidiRejected() {
    renderSettings(settingsLayout);
    updateSettings();
}

var score = null;

window.onload = () => {
    score = new Score();

    const midiList = document.getElementById("midi-devices");
    const item = document.createElement("li");
    item.innerHTML = `[Synth] Tone.js Synth`;
    midiList.appendChild(item);

}

async function start() {
    await Tone.start();

    loadSettings();

    if (settings.activeOutputName == 'Synth') {
        Player = SynthPlayer;
    } else {
        Player = MIDIPlayer;
    }

    const player = new Player();

    score.clear();
    score.destruct();
    score = new Score();
    score.renderClef();
    score.renderKeySignature(settings.root, settings.scale);
    score.draw();

    const main = new Main(score, player);
    main.queueExercise();
    main.runUI();

    Tone.Transport.start();

    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
}
