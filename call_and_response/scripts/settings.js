const SETTINGS_DIV = "settingsArea";

const settingsLayout = {
    figure: [
        "Interval with one known note",
        "Short ascending figure",
        "Interval in key",
        "Interval in key with random rhythm",
        "Random note rhythm",
        "Four note figure",
        "Two octave exploration",
        "Triad chords"
    ],
    root: "C2",
    intervals: ["Major","Major Pentatonic","Minor","Minor Pentatonic","Chromatic","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian", "Fourth and Fifth"],
    tempo: 100,
    amountOfFigures: 60,
    exerciseMode: ["Read along", "Listen and play back"],
    clef: ["Bass", "Treble"],
    activeOutputName: ["Synth"],
    midiProgram: 33,
}

const settingsLabels = {
    tempo: "Tempo",
    root: "Root note",
    intervals: "Scale",
    amountOfFigures: "Number of figures",
    clef: "Clef",
    midiProgram: "MIDI instrument",
    figure: "Figure",
    activeOutputName: "Output device",
    exerciseMode: "Exercise mode"
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
    "Bass": "bass",
    "Treble": "treble",
    "Read along": "reading",
    "Listen and play back": "listen",
    "Interval with one known note": "KnownRoot",
    "Interval in key": "InKeyInterval",
    "Interval in key with random rhythm": "InKeyRhythmicInterval",
    "Short ascending figure": "ShortAscending",
    "Random note rhythm": "RandomRootRythm",
    "Four note figure": "FourNote",
    "Two octave exploration": "TwoOctaveExploration",
    "Triad chords": "TriadChord"
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
        root: "C2",
        intervals: "major",
        midiProgram: 33,
        clef: "bass",
        figure: "KnownRoot",
        exerciseMode: "listen"
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
                    break
                case 'activeOutputName':
                    settings['activeOutputName'] = userSettings.activeOutputName || "Synth";
                default:
                    settings[setting] = userSettings[setting];
            }
        }
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
