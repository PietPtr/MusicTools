WebMidi.enable()
    .then(onEnabled)
    .catch((err) => alert(err));

function onEnabled() {
    const main = new Main();
    
}


// const main = new Main();

// main.loadMIDIContext().then((v) => {
//     console.log(v, main.midi);
//     // Call some sort of start playing method
//     main.listOutputs();
// });
