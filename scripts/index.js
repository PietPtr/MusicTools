
let settings = {
    tempo: 100, // BPM
    generators: //[EighthNoteRythmFigure],
        [EighthNoteRythmFigure, ShortAscendingFigure, KnownEndRootFigure, KnownStartRootFigure],
    amountOfFigures: 30,
    activeOutputIndex: 1
    // TODO: seed a PRNG to be able to repeat sessions
}

WebMidi.enable()
    .then(onEnabled)

function onEnabled() {
    WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));
    
}

function start() {
    const main = new Main(WebMidi.time);
    main.runUI();

    main.queueIntroSticks();
    for (let i = 0; i < settings.amountOfFigures; i++) {
        main.queueMeasure();
    }
}