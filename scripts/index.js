
let settings = {
    tempo: 100, // BPM
    generators: [ShortAscendingFigure],
        // [EightNoteRythmFigure, ShortAscendingFigure, KnownEndRootFigure, KnownStartRootFigure],
    amountOfFigures: 3
    // TODO: seed a PRNG to be able to repeat sessions
}

WebMidi.enable()
    .then(onEnabled)

function onEnabled() {
    WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));
    
    const main = new Main();

    for (let i = 0; i < settings.amountOfFigures; i++) {
        main.queueMeasure();
    }

}
