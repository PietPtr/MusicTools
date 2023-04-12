


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

window.onload = () => {
    updateSettingsTextarea();
}

function start() {
    loadSettings();
    console.log(settings);

    const main = new Main(WebMidi.time);
    main.runUI();

    main.queueIntroSticks();
    for (let i = 0; i < settings.amountOfFigures; i++) {
        main.queueMeasure();
    }
}