
const defaultSettings = 
`Global settings:
  Tempo: 100
  Root note: C2
  Intervals: major
  Amount of figures: 100
  MIDI device index: Synth
  MIDI instrument: 33
  Clef: bass
  Figure: Interval with one known note
Figures:
  Interval with one known note:
  Short ascending figure:
  Eighth note rhythm:
  Random note rythm:
`

const translations = {
    "Global settings": "global",
        "Tempo": "tempo",
        "Root note": "root",
        "Intervals": "intervals",
        "Amount of figures": "amountOfFigures",
        "MIDI device index": "activeOutputIndex",
        "MIDI instrument": "midiProgram",
        "Clef": "clef",
        "Figure": "figure",
    "Figures": "figures",
        "Interval with one known note": "KnownRoot",
        "Eighth note rhythm": "EighthNoteRythm",
        "Short ascending figure": "ShortAscending",
        "Random note rythm": "RandomRootRythm",
};

function translate(settings) {
    function translate1(word) {
        if (word in translations) {
            return translations[word];
        } else {
            alert(`Unknown setting '${word}'.`);
        }
    }

    const translated = {};

    for (let setting in settings) {
        if (typeof settings[setting] === 'object') {
            translated[translate1(setting)] = translate(settings[setting]);
        } else {
            translated[translate1(setting)] = settings[setting];
        }
    }

    return Object.keys(translated).length == 0 ? null : translated;
}

function resetSettingsToDefaults() {
    document.getElementById("settings").value = defaultSettings;
}

let settings = {
    tempo: 0, // BPM
    amountOfFigures: 0,
    activeOutputIndex: 0,
    root: null,
    intervals: null,
    midiProgram: 0,
    clef: 'bass',
    figure: null,
    version: 2 // increment on breaking settings change
}

function loadSettings() {
    const yamlText = document.getElementById("settings").value;
    const userSettings = translate(jsyaml.load(yamlText));
    
    for (let setting in userSettings.global) {
        if (!(setting in settings)) {
            return alert(`Unknown setting '${setting}' in global.`);
        } else {
            switch (setting) {
                case 'intervals':
                    settings['intervals'] = scales[userSettings.global['intervals']];
                    break
                default:
                    settings[setting] = userSettings.global[setting];
            }
        }
    }

    settings.figure = classNames[translations[userSettings.global.figure]];

    saveSettings();
}

function saveSettings() {
    const yamlText = document.getElementById("settings").value;
    localStorage.setItem("settings", yamlText);
    localStorage.setItem("settingsVersion", settings.version);
}

function updateSettingsTextarea() {
    const storedSettings = localStorage.getItem("settings")
    
    if (storedSettings && localStorage.getItem("settingsVersion") == settings.version) {
        document.getElementById("settings").innerHTML = storedSettings;
    } else {
        document.getElementById("settings").innerHTML = defaultSettings;
    }
}