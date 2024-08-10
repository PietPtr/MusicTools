
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

class FunctionUIEvent extends UIEvent {
    constructor(func, time) {
        super(null, null, time);
        this.func = func;
    }

    render() {
        this.func();
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
        this.last_notes = null;

        this.measuresPerFigure = settings.exerciseMode + 1;
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

    measureTime(offset = 0) {
        return this.startTime + measureToTime(this.measure + offset);
    }

    queueExercise() {
        this.queueIntroSticks();
        for (let i = 0; i < settings.amountOfFigures; i++) {
            this.queueMeasure();
        }
        this.uiEvents.push(new ScoreUIEvent(this.score, [], this.measureTime(), 'main'));
        this.uiEvents.push(new ScoreUIEvent(this.score, [], this.measureTime(-this.measuresPerFigure), 'next'));

        this.queueEndEvent();
    }

    queueMeasure() {
        const GenerateClass = settings.figure;

        let notes = GenerateClass.generate();
        let timeout = 10;

        while (JSON.stringify(notes) === JSON.stringify(this.last_notes) && timeout >= 1) {
            notes = GenerateClass.generate();
            timeout--;
        }

        this.last_notes = notes;

        this.addUIEvent("figure", GenerateClass.displayName, this.measureTime());
        this.addUIEvent("bar", this.figure, this.measureTime());

        if (settings.renderScore) {
            this.uiEvents.push(new ScoreUIEvent(this.score, notes, this.measureTime(), 'main'));
            this.uiEvents.push(new ScoreUIEvent(this.score, notes, this.measureTime(-this.measuresPerFigure), 'next'));
        }

        let time = 0;
        for (let note of notes) {
            this.player.schedule(note, this.measureTime() + time);
            time += noteDuration(note.duration);
        }

        this.queueMetronome(GenerateClass.measures * this.measuresPerFigure);
        this.measure += GenerateClass.measures * this.measuresPerFigure;
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

        this.uiEvents.push(new FunctionUIEvent(() => {
            const startButton = document.getElementById('startButton');
            startButton.disabled = false;
        }, this.measureTime()));
    }
}

