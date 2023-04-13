
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

        renderer.resize(500, 100);
        this.context = renderer.getContext();

        this.stave = new Stave(10, 0, 400);
        this.stave.addTimeSignature("4/4");
        this.stave.setContext(this.context).draw();
    }

    clear() {
        this.context.rect(0, 0, 500, 100, { stroke: 'none', fill: 'white' });
    }

    renderClef() {
        this.clear();
        this.stave.addClef(settings.clef);
        this.stave.setContext(this.context).draw();
    }

    // supporting multiple measures is apparently difficult-ish, so one bar for now.
    renderNotes(noteList) {    
        const quarterRest = "D3/w/r";
        var noteStrings = [];

        const notes = [];
        for (let note of noteList) {
            let staveNote = new Vex.StaveNote({ keys: [`${note.name}/${note.octave + 1}`], duration: 1/note.barDuration, clef: settings.clef});
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

            let rest = new Vex.StaveNote({ keys: [restNote], duration: `${1 / smallestRest(sumNotes(), 1)}r`, clef: settings.clef});
            notes.push(rest);

            break;
        }

        const voice = new Vex.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(notes);
        new Vex.Formatter().joinVoices([voice]).format([voice], 400);

        this.clear();
        this.stave.setContext(this.context).draw();
        voice.draw(this.context, this.stave);
    }
}
