

class Main {
    constructor() {
        this.settings = {
            activeOutputIndex: 0,
            allowedCallClasses: []
        }
        this.activeOutput = WebMIDI.outputs.getOutputById(settings.activeOutputIndex);
    }

    loadMIDIContext() {
        const onMIDISuccess = (midiAccess) => {
            console.log("MIDI ready!");
            this.midi = midiAccess;
            this.activeOutput = this.midi.outputs.get(0); // TODO: make configurable
            return new Promise((resolve, reject) => {
                resolve('MIDI loaded')
            })
        }

        const onMIDIFailure = (msg) => {
            console.error(`Failed to get MIDI access - ${msg}`);
        }

        return navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }

    listOutputs() {
        for (const entry of this.midi.outputs) {
            const output = entry[1];
            console.log(
                `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`
            );
        }
    }
}

