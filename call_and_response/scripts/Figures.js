class CRNote {
    constructor(pitch, duration, attack) {
        this.pitch = pitch;
        this.duration = duration;
        this.attack = attack;

        this.webMidiNote = new Note(pitch, { duration: noteDuration(duration), attack: attack });
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
    return new CRNote(pitch, duration, 1.0);
}

function rest(duration) {
    return new CRNote("C2", duration, 0);
}

function midiValue(noteName) {
    const note = new Note(noteName, { duration: 1 });
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
    static displayName = "Always start or end on root, other note is some interval above it."

    static generate() {
        const s = settings;
        const root = note(s.root, quarter);
        const [_, ...nonRootIntervals] = s.intervals
        const next = note(midiValue(s.root) + choice(nonRootIntervals), quarter);

        return takeRandom([[next, root], [root, next]]);
    }
}

class ShortAscendingFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Three note ascending figure.";

    static getRandomNotes(N) {
        const selected = new Set();
        while (selected.size < 3) {
            const randomInt = Math.floor(Math.random() * N);
            selected.add(randomInt);
        }
        return Array.from(selected);
    }

    static generate() {
        const s = settings;

        if (s.notes.length <= 2) {
            alert(`Range ${s.rangeBottom} - ${s.rangeTop} is not large enough to create 3 note ascending figure.`);
        }

        // as the start note, pick any note in the first N - 2 elements of the note list
        const noteIndices = ShortAscendingFigure.getRandomNotes(s.notes.length).sort((a, b) => a - b);

        let notes = [];

        for (let noteIdx of noteIndices) {
            notes.push(note(s.notes[noteIdx].identifier, quarter));
        }

        return notes;
    }
}

class InKeyIntervalFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Two quarter notes from the selected range and key";

    static generate() {
        const s = settings;

        const selected = new Set();
        while (selected.size < 2) {
            if (selected.size == 1) {
                let other_note = selected.values().next().value;
                let note = choice(s.notes).number;
                let diff = Math.abs(note - other_note);
                if (diff > 0 && diff < 13) { //  Notes fall within the same octave
                    selected.add(note);
                }
            } else {
                let note = choice(s.notes).number;
                selected.add(note);
            }
        }

        let notes = Array.from(selected);
        return [note(notes[0], quarter), note(notes[1], quarter)];
    }
}

class InKeyRhythmicIntervalFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "[BROKEN VIEW] Two random duration notes from the selected octave";

    static generate() {
        // TODO: use the given range
        const s = settings;
        const genNote = () => {
            let interval = choice(s.intervals);
            let duration = choice([quarter, half]);
            return note(midiValue(s.root) + interval, duration);
        }

        return [genNote(), genNote()];
    }
}


class QuickSteppedMelodyFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Eighth note melody in key with small steps.";
    static lastIdx = null;

    static generate() {
        const s = settings;

        let notes = [];

        if (!QuickSteppedMelodyFigure.lastIdx) {
            QuickSteppedMelodyFigure.lastIdx = randint(0, s.notes.length - 1);
        }

        let noteIdx = QuickSteppedMelodyFigure.lastIdx;
        notes.push(note(s.notes[noteIdx].number, eighth));

        for (let i = 0; i < 5; i++) {
            noteIdx = Math.min(Math.max(noteIdx + randint(-1, 1), 0), s.notes.length - 1);
            notes.push(note(s.notes[noteIdx].number, eighth));
        }

        QuickSteppedMelodyFigure.lastIdx = noteIdx;

        return notes;
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
    static displayName = "Move up and down through two octaves of the key, by at most a third per step."
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
    "InKeyInterval": InKeyIntervalFigure,
    "InKeyRhythmicInterval": InKeyRhythmicIntervalFigure,
    "RandomRootRythm": RandomRootRythmFigure,
    "FourNote": FourNoteFigure,
    "TwoOctaveExploration": TwoOctaveExplorationFigure,
    "TriadChord": TriadChordFigure,
    "QuickSteppedMelodyFigure": QuickSteppedMelodyFigure,
}