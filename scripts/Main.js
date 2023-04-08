

class Main {
    constructor() {
        this.settings = {
            activeOutputIndex: 1,
            allowedFigureClasses: []
        }
        this.activeOutput = WebMidi.outputs[this.settings.activeOutputIndex];
        this.measure = 0;

        console.log(this.activeOutput);
    }

    measureTime() {
        return measureToTime(this.measure);
    }

    queueMeasure() {
        const GenerateClass = choice(settings.generators);
        const notes = GenerateClass.generate();

        let time = 0;
        for(let note of notes) {
            // console.log(note);
            this.activeOutput.playNote(note, {time: this.measureTime() + time});
            time += note.duration;
        }

        this.queueMetronome(GenerateClass.measures * 2);
        this.measure += GenerateClass.measures * 2;
    }

    queueMetronome(measures) {
        const drumChannel = this.activeOutput.channels[10];
        for (let tick of metronome(measures, 4, quarter)) {
            drumChannel.playNote(tick.midiValue, {time: this.measureTime() + tick.time, attack: 1});
        }
    }
}

