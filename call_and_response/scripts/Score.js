
function toggleScoreVisibility() {
    const score = document.getElementById("score");
    if (score.style.display === "") {
        score.style.display = "none";
    } else {
        score.style.display = "";
    }
}

class Score {
    constructor() {
        const { Renderer, Stave } = Vex.Flow;

        const div = document.getElementById("score");
        const renderer = new Renderer(div, Renderer.Backends.SVG);

        const STAVEWIDTH = 200;

        renderer.resize(STAVEWIDTH * 1.3 + STAVEWIDTH + 20, 200);
        this.context = renderer.getContext();

        const stave1 = new Stave(10, 76, STAVEWIDTH * 1.3);
        stave1.addTimeSignature("4/4");
        stave1.setContext(this.context).draw();

        const staveNext = new Stave(STAVEWIDTH * 1.3 + 10, 76, STAVEWIDTH);
        staveNext.setContext(this.context).draw();

        this.staves = {
            main: stave1,
            next: staveNext
        };

        this.useFlats = false;
        this.key = "";
    }

    destruct() {
        const div = document.getElementById("score");

        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
    }

    clear(stave) {
        if (stave) {
            const x = this.staves[stave].x;
            const y = this.staves[stave].y;
            const w = this.staves[stave].width;
            const h = this.staves[stave].height;
            this.context.rect(x, y - 100, w, h + 200, { stroke: 'none', fill: 'white' });
        } else {
            this.context.rect(0, 0, this.context.width, this.context.height, { stroke: 'none', fill: 'white' });
        }
    }

    draw() {
        this.staves.main.setContext(this.context).draw();
        this.staves.next.setContext(this.context).draw();
    }

    renderClef() {
        this.staves.main.addClef(settings.clef);
    }

    renderKeySignature(root, scale) {
        console.log(root, scale);

        var root_note_id = new Note(root).number;

        var offset = 0;
        switch (scale) {
            case 'lydian':
                offset = 7;
                break;
            case 'mixolydian':
                offset = 5;
                break;
            case 'dorian':
                offset = 11;
                break;
            case 'aeolian':
            case 'minor':
                offset = 3;
                break;
            case 'phrygian':
                offset = 8;
                break;
            case 'locrian':
                offset = 1;
                break;
        }

        var new_root = new Note(root_note_id + offset);

        if (root.includes('b')) {
            new_root = flatEnharmonic(new_root);
            this.useFlats = true;
        }

        this.key = new_root.identifier.replace(/\d/g, '');

        var keySignature = new Vex.Flow.KeySignature(new_root.identifier.replace(/\d/g, ''));
        keySignature.addToStave(this.staves.main);
    }

    noteIsInKey(note) {
        switch (this.key) {
            case "C":
                return ["C", "D", "E", "F", "G", "A", "B"].includes(note);
            case "G":
                return ["G", "A", "B", "C", "D", "E", "F#"].includes(note);
            case "D":
                return ["D", "E", "F#", "G", "A", "B", "C#"].includes(note);
            case "A":
                return ["A", "B", "C#", "D", "E", "F#", "G#"].includes(note);
            case "E":
                return ["E", "F#", "G#", "A", "B", "C#", "D#"].includes(note);
            case "B":
                return ["B", "C#", "D#", "E", "F#", "G#", "A#"].includes(note);
            case "F#":
                return ["F#", "G#", "A#", "B", "C#", "D#", "E#"].includes(note);
            case "Gb":
                return ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"].includes(note);
            case "Db":
                return ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"].includes(note);
            case "Ab":
                return ["Ab", "Bb", "C", "Db", "Eb", "F", "G"].includes(note);
            case "Eb":
                return ["Eb", "F", "G", "Ab", "Bb", "C", "D"].includes(note);
            case "Bb":
                return ["Bb", "C", "D", "Eb", "F", "G", "A"].includes(note);
            case "F":
                return ["F", "G", "A", "Bb", "C", "D", "E"].includes(note);
            default:
                console.error(`Don't know key '${this.key}'`)
        }
    }

    renderNotes(noteList, staveId) {
        const notes = [];
        for (let note of noteList) {
            var accidental = note.webMidiNote.accidental || "";

            if (this.useFlats && accidental != "") {
                note.webMidiNote = flatEnharmonic(note.webMidiNote);
                accidental = 'b';
            }

            // note is in key, don't draw an accidental
            if (this.noteIsInKey(note.webMidiNote.identifier.replace(/\d/g, ''))) {
                accidental = '';
            }

            let staveNote = new Vex.StaveNote({ keys: [`${note.name().toLowerCase()}${accidental}/${note.octave() + 1}`], duration: 1 / note.duration, clef: settings.clef })

            // TODO: doesn't always print the correct accidental
            if (accidental != "") {
                staveNote.addModifier(new Vex.Accidental(accidental));
            }

            notes.push(staveNote);
        }

        let sumNotes = () => {
            return notes.reduce((prev, cur) => {
                return prev + 1 / (parseInt(cur.duration));
            }, 0);
        }

        const restNote = settings.clef == 'bass' ? 'd/3' : 'c/5';

        while (sumNotes() < 1) {
            let smallestRest = (sum, attempt) => sum % attempt == 0 ? attempt : smallestRest(sum, attempt / 2)

            let rest = new Vex.StaveNote({ keys: [restNote], duration: `${1 / smallestRest(sumNotes(), 1)}r`, clef: settings.clef });
            notes.push(rest);

            break;
        }

        const voice = new Vex.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(notes);
        const formatter = new Vex.Formatter().joinVoices([voice]).format([voice], this.staves[staveId].width);
        formatter.formatToStave([voice], this.staves[staveId]);

        this.clear(staveId);
        this.staves[staveId].setContext(this.context).draw();
        voice.draw(this.context, this.staves[staveId]);
    }
}
