class CRNote {
    constructor(pitch, duration, attack) {
        this.pitch = pitch;
        this.duration = duration;
        this.attack = attack;

        this.webMidiNote = new Note(pitch, {duration: noteDuration(duration), attack: attack});
    }

    name() {
        return this.webMidiNote.name;
    }

    octave() {
        return this.webMidiNote.octave;
    }

    fullname() {
        return `${this.webMidiNote.name}${this.webMidiNote.octave}`;
    }
}


function note(pitch, duration) {
    return new CRNote(pitch, duration, 0.3);
}

function rest(duration) {
    // return new Note("C2", {duration: noteDuration(duration), attack: 0});
    return new CRNote("C2", duration, 0);
}

function midiValue(noteName) {
    const note = new Note(noteName, {duration: 1});
    return note.getOffsetNumber();
}

class EmptyFigure {
    static measures = 1;
    static settings = {};
    static displayName = "No name found for figure";

    static generate() {
        return [];
    }
}

class KnownRootFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Known start note, one interval."

    static generate() {
        const s = settings;
        const root = note(s.root, quarter);
        const next = note(midiValue(s.root) + choice(s.intervals), quarter);
        
        return takeRandom([[next, root], [root, next]]);
    }
}

class ShortAscendingFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Three note ascending figure.";

    static generate() {
        const s = settings;
        const root = note(s.root, quarter);
        let upperNotes = [choice(s.intervals), choice(s.intervals)].sort((a, b) => a - b);
        upperNotes = upperNotes.map(interval => note(midiValue(s.root) + interval, quarter));
        return [root, ...upperNotes];
    }
}

class RandomRootRythmFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Rythm in random note of the scale.";

    static generate() {
        const s = settings
        const durations = [quarter, quarter, eighth, eighth];
        const offset = choice(s.intervals);
        const notes = []
        while (durations.length > 0) {
            notes.push(note(midiValue(s.root) + offset, takeRandom(durations)));
        }

        return notes;
    }
}

class FourNoteFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Four quarter notes from the scale"

    static generate() {
        const s = settings;
        const notes = [];

        for (let i = 0; i < 4; i++) {
            const offset = choice(s.intervals);
            notes.push(note(midiValue(s.root) + offset, quarter));
        }
        
        return notes;
    }
}

class TwoOctaveExplorationFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Move up and down through two octaves of the key, by at most a fifth per step."
    static currentNote = 0;
    static direction = 1;

    static generate() {
        const s = settings;

        const notes = [];
        
        let direction = TwoOctaveExplorationFigure.direction;
        let degree = TwoOctaveExplorationFigure.currentNote;;
        for (let i = 0; i < 4; i++) {
            degree += randint(0, 2) * direction;
            if (direction == 1 && degree > 14) {
                degree = 14;
                direction = -1;
            } else if (direction == -1 && degree < 0) {
                degree = 0;
                direction = 1;
            }
            const offset = s.intervals[degree % 7] + Math.floor(degree / 7) * 12;
            notes.push(note(midiValue(s.root) + offset, quarter));
        }

        TwoOctaveExplorationFigure.currentNote = degree;
        TwoOctaveExplorationFigure.direction = direction;

        return notes
    }
}

class TriadChordFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Three quarter notes from a triad in the key in any order."

    static generate() {
        const s = settings;
        const baseDegree = randint(0, 6); // 0 = I, 1 = ii, ... 6 = vii
        const thirdDegree = baseDegree + 2;
        const fifthDegree = thirdDegree + 2;        

        const noteValues = [
            midiValue(s.root) + s.intervals[baseDegree % 7],
            midiValue(s.root) + s.intervals[thirdDegree % 7],
            midiValue(s.root) + s.intervals[fifthDegree % 7]
        ]

        const notes = noteValues.map(value => note(value, quarter));
        
        return shuffle(notes);
    }
}


const classNames = {
    "KnownRoot": KnownRootFigure,
    "ShortAscending": ShortAscendingFigure,
    "RandomRootRythm": RandomRootRythmFigure,
    "FourNote": FourNoteFigure,
    "TwoOctaveExploration": TwoOctaveExplorationFigure,
    "TriadChord": TriadChordFigure
}