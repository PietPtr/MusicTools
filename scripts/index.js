


WebMidi.enable()
    .then(onEnabled)

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
}

function start() {
    // if already running, reload / cancel / deny
    loadSettings();

    score.renderClef();

    const main = new Main(WebMidi.time, score);
    main.runUI();

    main.queueIntroSticks();
    for (let i = 0; i < settings.amountOfFigures; i++) {
        main.queueMeasure();
    }
}