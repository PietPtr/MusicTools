
let Player = SynthPlayer;

WebMidi.enable()
    .then(onMidiEnabled, onMidiRejected);
    
function onMidiEnabled() {
    midiList = document.getElementById("midi-devices");

    WebMidi.outputs.forEach((output, index) => {
        const item = document.createElement("li");
        item.innerHTML = `[${index}] ${output.name}`;
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
    score.renderClef();
    score.renderKeySignature(settings.root);
    score.draw();

    const main = new Main(score, player);

    // This whole thing should just live in main
    main.queueIntroSticks();
    for (let i = 0; i < settings.amountOfFigures; i++) {
        main.queueMeasure();
    }
    main.uiEvents.push(new ScoreUIEvent(main.score, [], main.measureTime(-2), 'next'));

    main.queueEndEvent();
    //

    main.runUI();

    Tone.Transport.start();

    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
}
