
class UIEvent {
    constructor(elementID, newValue, time) {
        this.elementID = elementID;
        this.newValue = newValue;
        this.time = time;
    }

    render() {
        const element = document.getElementById(this.elementID);
        element.innerHTML = this.newValue;
    }
}

class Main {
    constructor(startTime) {
        this.activeOutput = WebMidi.outputs[settings.activeOutputIndex];
        this.measure = 0;
        this.uiEvents = [];
        this.addUIEvent("tempo", settings.tempo, 0);
        this.startTime = startTime;

        console.log(this.activeOutput);
    }

    addUIEvent(elementID, newValue, time) {
        const uiEvent = new UIEvent(elementID, newValue, time);
        this.uiEvents.push(uiEvent);
    }

    runUI() {
        window.setInterval(() => {
            while (this.uiEvents.length > 0 && WebMidi.time > this.uiEvents[0].time) {
                this.uiEvents[0].render();
                this.uiEvents.shift();
            }
        }, 50);
    }

    measureTime() {
        return this.startTime + measureToTime(this.measure);
    }

    queueMeasure() {
        const GenerateClass = choice(settings.generators);
        const notes = GenerateClass.generate();

        this.addUIEvent("figure", GenerateClass.displayName, this.measureTime());
        if (GenerateClass.settings.key) {
            this.addUIEvent("root", GenerateClass.settings.key, this.measureTime());
        }
        if (GenerateClass.settings.root) {
            this.addUIEvent("root", GenerateClass.settings.root, this.measureTime());
        }

        let time = 0;
        for(let note of notes) {
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

    queueIntroSticks() {
        const ticks = metronome(2, 4, quarter);
        let i = 0;
        for (let tick of ticks) {
            if (i != 1 && i != 3) {
                this.activeOutput.channels[10].playNote(31, {time: this.measureTime() + tick.time, attack: 1});
            }
            i++;
        }
        this.measure += 2;
    }
}

