
class UIEvent {
    constructor(elementID, newValue, time, player) {
        this.elementID = elementID;
        this.newValue = newValue;
        this.time = time;
        this.player = player;
    }

    render() {
        const element = document.getElementById(this.elementID);
        element.innerHTML = this.newValue;
    }
}

class ScoreUIEvent extends UIEvent {
    constructor(score, notes, time, stave) {
        super(null, null, time);
        this.notes = notes;
        this.score = score;
        this.stave = stave;
    }

    render() {
        this.score.renderNotes(this.notes, this.stave);
    }
}

class Main {
    constructor(score, player) {
        this.measure = 0;
        this.uiEvents = [];
        this.addUIEvent("tempo", settings.tempo, 0);
        this.startTime = player.now();
        this.score = score;
        this.figure = 1;
        this.player = player;
    }

    addUIEvent(elementID, newValue, time) {
        const uiEvent = new UIEvent(elementID, newValue, time);
        this.uiEvents.push(uiEvent);
    }

    runUI() {
        this.uiEvents.sort((a, b) => {
            return a.time - b.time;
        });

        const timeSpan = document.getElementById("timeDebug");
        
        window.setInterval(() => {
            // timeSpan.innerHTML = (this.player.now() / 1000).toFixed(2);
            while (this.uiEvents.length > 0 && this.player.now() > this.uiEvents[0].time) {
                this.uiEvents[0].render();
                this.uiEvents.shift();
            }
        }, 50);
    }

    measureTime(offset=0) {
        return this.startTime + measureToTime(this.measure + offset);
    }

    queueMeasure() {
        const GenerateClass = settings.figure;
        const notes = GenerateClass.generate();

        this.addUIEvent("figure", GenerateClass.displayName, this.measureTime());
        this.addUIEvent("bar", this.figure, this.measureTime());
        this.uiEvents.push(new ScoreUIEvent(this.score, notes, this.measureTime(), 'main'));
        this.uiEvents.push(new ScoreUIEvent(this.score, notes, this.measureTime(-2), 'next'));

        let time = 0;
        for(let note of notes) {
            this.player.schedule(note, this.measureTime() + time);
            time += noteDuration(note.duration);
        }

        this.queueMetronome(GenerateClass.measures * 2);
        this.measure += GenerateClass.measures * 2;
        this.figure++;
    }

    queueMetronome(measures) {
        for (let tick of metronome(measures, 4, quarter)) {
            this.player.drums(tick.midiValue, this.measureTime() + tick.time);
        }
    }

    queueIntroSticks() {
        this.addUIEvent("bar", "0", this.measureTime());
        this.addUIEvent("root", settings.root, this.measureTime());

        const ticks = metronome(2, 4, quarter);
        let i = 0;
        for (let tick of ticks) {
            if (i != 1 && i != 3) {
                this.player.drums(31, this.measureTime() + tick.time);
            }
            i++;
        }
        this.measure += 2;
    }

    queueEndEvent() {
        this.addUIEvent("figure", "...", this.measureTime());
        this.addUIEvent("root", "...", this.measureTime());
        this.addUIEvent("bar", "...", this.measureTime());
        this.addUIEvent("tempo", "...", this.measureTime());
        this.player.drums(49, this.measureTime());

    }
}

