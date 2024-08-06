const SETTINGS_DIV = "settingsArea";

const settingsLayout = {
    figure: [
        "Interval with one known note",
        "Short ascending figure",
        "Short ascending figure with rhythm",
        "Interval in key",
        "Interval in key with random rhythm",
        "Random note rhythm",
        "Four note figure",
        "Two octave exploration",
        "Triad chords",
        "Stepped melody",
    ],
    root: "C",
    intervals: [
        "Major",
        "Major Pentatonic",
        "Minor",
        "Minor Pentatonic",
        "Chromatic",
        "Dorian",
        "Phrygian",
        "Lydian",
        "Mixolydian",
        "Aeolian",
        "Locrian",
        "Fourth and Fifth",
        "Thirds"],
    rangeBottom: "E1",
    rangeTop: "B2",
    tempo: 100,
    amountOfFigures: 60,
    exerciseMode: 0,
    clef: ["Bass", "Treble"],
    activeOutputName: ["Synth"],
    midiProgram: 33,
}

const settingsLabels = {
    tempo: "Tempo",
    root: "Root note",
    rangeBottom: "Lowest note",
    rangeTop: "Highest note",
    intervals: "Scale",
    amountOfFigures: "Number of figures",
    clef: "Clef",
    midiProgram: "MIDI instrument",
    figure: "Figure",
    activeOutputName: "Output device",
    exerciseMode: "Measures after figure"
}

const optionInternalValues = {
    "Major": "major",
    "Major Pentatonic": "major_pentatonic",
    "Minor": "minor",
    "Minor Pentatonic": "minor_pentatonic",
    "Chromatic": "chromatic",
    "Dorian": "dorian",
    "Phrygian": "phrygian",
    "Lydian": "lydian",
    "Mixolydian": "mixolydian",
    "Aeolian": "aeolian",
    "Locrian": "locrian",
    "Fourth and Fifth": "r45",
    "Thirds": "thirds",
    "Bass": "bass",
    "Treble": "treble",
    "Read along": "reading",
    "Listen and play back": "listen",
    "Interval with one known note": "KnownRoot",
    "Interval in key": "InKeyInterval",
    "Interval in key with random rhythm": "InKeyRhythmicInterval",
    "Short ascending figure": "ShortAscending",
    "Short ascending figure with rhythm": "ShortAscendingWithRhythm",
    "Random note rhythm": "RandomRootRythm",
    "Four note figure": "FourNote",
    "Two octave exploration": "TwoOctaveExploration",
    "Triad chords": "TriadChord",
    "Stepped melody": "QuickSteppedMelodyFigure",
}

const internalToOptionValues = Object.fromEntries(Object.entries(optionInternalValues).map(([key, value]) => [value, key]));


function renderSettings(settings) {
    var container = document.getElementById(SETTINGS_DIV);

    // clear previous settings
    container.innerHTML = '';

    let table = document.createElement('table');

    for (let key in settings) {
        let value = settings[key];

        let row = document.createElement('tr');

        let labelCell = document.createElement('td');
        let label = document.createElement('label');
        label.htmlFor = key;
        label.textContent = settingsLabels[key];
        labelCell.appendChild(label);

        row.appendChild(labelCell);

        let inputCell = document.createElement('td');
        let input;
        if (Array.isArray(value)) {
            input = document.createElement('select');
            value.forEach(option => {
                let optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                input.appendChild(optionElement);
            });
        } else if (Number.isInteger(value)) {
            input = document.createElement('input');
            input.type = 'number';
            input.value = value;
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = value;
        }
        input.id = `settings_${key}`;
        input.onchange = saveSettings;
        inputCell.appendChild(input);

        row.appendChild(inputCell);

        table.appendChild(row);
    }

    container.appendChild(table);
}

function readSettings() {
    var container = document.getElementById(SETTINGS_DIV);

    let settings = {};
    let inputs = container.querySelectorAll('input, select');
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        const settingKey = input.id.split('_')[1];
        if (input.tagName.toLowerCase() === 'select') {
            settings[settingKey] = optionInternalValues[input.value] || input.value;
        } else if (input.type === 'number') {
            settings[settingKey] = parseInt(input.value, 10);
        } else {
            settings[settingKey] = input.value;
        }
    }

    return settings;
}

function resetSettingsToDefaults() {
    const defaultSettings = {
        tempo: 100,
        amountOfFigures: 100,
        activeOutputName: "Synth",
        root: "C",
        rangeBottom: "E1",
        rangeTop: "B2",
        intervals: "major",
        midiProgram: 33,
        clef: "bass",
        figure: "KnownRoot",
        exerciseMode: 1,
    }

    localStorage.setItem('settings', JSON.stringify(defaultSettings));
    updateSettings();
    loadSettings();
}

let settings = {
    tempo: 0, // BPM
    amountOfFigures: 0,
    activeOutputName: "Synth",
    root: null,
    rangeBottom: null,
    rangeTop: null,
    intervals: null,
    midiProgram: 0,
    clef: 'bass',
    figure: null,
    exerciseMode: null,
}

function loadSettings() {
    const userSettings = readSettings();

    for (let setting in userSettings) {
        if (!(setting in settings)) {
            return alert(`Unknown setting '${setting}'.`);
        } else {
            switch (setting) {
                case 'intervals':
                    settings['intervals'] = scales[userSettings.intervals];
                    settings['scale'] = userSettings.intervals;
                    break
                case 'activeOutputName':
                    settings['activeOutputName'] = userSettings.activeOutputName || "Synth";
                case 'root':
                    // Pick a root in the given range
                    bottomNoteNumber = new Note(userSettings.rangeBottom).number;
                    topNoteNumber = new Note(userSettings.rangeTop).number;

                    var root = null;
                    for (i = bottomNoteNumber; i <= topNoteNumber; i++) {
                        root = new Note(i);
                        if ((root.name + (root.accidental || "")) == userSettings.root) {
                            break;
                        }
                        root = flatEnharmonic(root);
                        if ((root.name + (root.accidental || "")) == userSettings.root) {
                            break;
                        }
                    }

                    if (!root) {
                        alert(`Cannot find a ${userSettings.root} in ${userSettings.rangeBottom} - ${userSettings.rangeTop}`);
                    }

                    settings['root'] = root.identifier;

                    // Fill settings['notes'] with the available notes in the key / range
                    var notes = [];
                    settings['key'] = rootScaleToKey(settings.root, userSettings.intervals);

                    for (i = bottomNoteNumber; i <= topNoteNumber; i++) {
                        const note = new Note(i);
                        const notename = note.name + (note.accidental || "");
                        const flatNote = flatEnharmonic(note);
                        const flatNoteName = flatNote.name + (flatNote.accidental || "");
                        if (noteIsInKey(settings['key'], notename)) {
                            notes.push(note);
                        } else if (noteIsInKey(settings['key'], flatNoteName)) {
                            notes.push(flatNote);
                        }
                    }

                    settings['notes'] = notes;

                    var noteString = "";

                    for (let note of notes) {
                        noteString += `${note.identifier} `;
                    }
                    console.log(noteString);
                default:
                    settings[setting] = userSettings[setting];
            }
        }
    }

    settings['renderScore'] = ["KnownRoot", "ShortAscending", "InKeyInterval"].includes(userSettings.figure);
    if (!settings['renderScore']) {
        console.error(`Not rendering figure ${userSettings.figure}, rendering is broken for this figure.`);
    }

    settings.figure = classNames[userSettings.figure];

    saveSettings();
}

function saveSettings() {
    let currentSettings = readSettings(SETTINGS_DIV);
    localStorage.setItem('settings', JSON.stringify(currentSettings));
}

function updateSettings() {
    let storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
        let settings = {};
        try {
            settings = JSON.parse(storedSettings);
        } catch (error) {
            console.log('Error parsing settings:', error);
            localStorage.setItem('settings', "{}");
        }

        for (let key in settings) {
            let value = settings[key];
            const id = `settings_${key}`;
            let input = document.getElementById(id);

            if (input) {
                if (input.type == 'select-one' || input.type === 'text') {
                    input.value = internalToOptionValues[value] || value;
                } else if (input.type === 'number') {
                    input.value = parseInt(value, 10);
                } else {
                    console.error(`Unkown input type for ${key}: ${value} (${input.type})`)
                }
            } else {
                console.error(`Cannot find settings field with id ${id}`);
            }
        }
    }
}
