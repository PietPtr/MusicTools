// Figure classes
// Contain a static settings object, 
// A static function generate that generates a list of WebMidi.Note objects
//      given a seed and using the global tempo setting

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

    static generate(seed) {
        return [];
    }
}

class KnownRootFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Known start note, one interval."
    static settings = {
        direction: "up"
    }

    static generate(seed) {
        const s = settings;
        const root = note(s.root, quarter);
        const next = note(midiValue(s.root) + choice(s.intervals), quarter);
        
        switch (s.direction) {
            case "up":
                return [root, next];
            case "down":
                return [next, root];        
            default:
                return takeRandom([[next, root], [root, next]]);
        }
    }
}

class ShortAscendingFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Three note ascending figure.";

    static generate(seed) {
        const s = settings;
        const root = note(s.root, quarter);
        let upperNotes = [choice(s.intervals), choice(s.intervals)].sort((a, b) => a - b);
        upperNotes = upperNotes.map(interval => note(midiValue(s.root) + interval, quarter));
        return [root, ...upperNotes];
    }
}

// class EighthNoteRythmFigure extends EmptyFigure {
//     static measures = 1;
//     static displayName = "Four note rythmic figure.";

//     static generate(seed) {
//         const durations = [quarter, quarter, eighth, eighth];
//         const notes = []
//         while (durations.length > 0) {
//             notes.push(note(settings.root, takeRandom(durations)));
//         }

//         return notes;
//     }
// }

class RandomRootRythmFigure extends EmptyFigure {
    static measures = 1;
    static displayName = "Rythm in random note of the scale.";

    static generate(seed) {
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


const classNames = {
    "KnownRoot": KnownRootFigure,
    "ShortAscending": ShortAscendingFigure,
    "RandomRootRythm": RandomRootRythmFigure,
}