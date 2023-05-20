
const defaultSettings = 
`Global settings:
  Tempo: 100
  Root override:
  Amount of figures: 100
  MIDI device index: Synth
  MIDI instrument: 33
  Clef: bass
Figures:
  Interval with known start note:
    Enabled: true
    Start note: C2
    Intervals: major
  Interval with known end note:
    Enabled: true
    End note: C2
    Intervals: major
  Short ascending figure:
    Enabled: true
    Start note: C2
    Intervals: major  
  Eighth note rhythm:
    Enabled: true
    Rythm note: D2
  Random note rythm:
    Enabled: true
    Root: C2
    Intervals: major
`

const translations = {
    "Global settings": "global",
        "Tempo": "tempo",
        "Root override": "rootOverride",
        "Amount of figures": "amountOfFigures",
        "MIDI device index": "activeOutputIndex",
        "MIDI instrument": "midiProgram",
        "Clef": "clef",
    "Figures": "figures",
        "Interval with known start note": "KnownStartRoot",
            "Enabled": "enabled",
            "Start note": "root",
            "Intervals": "intervals",
        "Interval with known end note": "KnownEndRoot",
            "End note": "root",
        "Eighth note rhythm": "EighthNoteRythm",
            "Rythm note": "root",
        "Short ascending figure": "ShortAscending",
        "Random note rythm": "RandomRootRythm",
            "Root": "root"
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
    figures: [],
    amountOfFigures: 0,
    activeOutputIndex: 0,
    rootOverride: null,
    midiProgram: 0,
    clef: 'bass',
}

function loadSettings() {
    const yamlText = document.getElementById("settings").value;
    const userSettings = translate(jsyaml.load(yamlText));
    
    for (let setting in userSettings.global) {
        if (!(setting in settings)) {
            return alert(`Unknown setting '${setting}' in global.`);
        } else {
            settings[setting] = userSettings.global[setting];
        }
    }

    for (let figure in userSettings.figures) {
        const FigureClass = classNames[figure];
        for (let setting in userSettings.figures[figure]) {
            const settingValue = userSettings.figures[figure][setting];
            switch (setting) {
                case 'intervals':
                    FigureClass.settings[setting] = scales[settingValue];
                    break
                case 'root':
                    if (settings.rootOverride)
                        FigureClass.settings['root'] = settings.rootOverride;
                    else
                        FigureClass.settings['root'] = settingValue;
                    break
                case 'enabled':
                    if (settingValue) {
                        settings.figures.push(FigureClass);
                    }
                default:
                    FigureClass.settings[setting] = settingValue;
            }
        }
    }

    localStorage.setItem("settings", yamlText);
}

function updateSettingsTextarea() {
    const storedSettings = localStorage.getItem("settings")
    
    if (storedSettings) {
        document.getElementById("settings").innerHTML = storedSettings;
    } else {
        document.getElementById("settings").innerHTML = defaultSettings;
    }
}