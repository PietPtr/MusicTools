
let settings = {
    tempo: 0, // BPM
    generators: [],
    amountOfFigures: 0,
    activeOutputIndex: 0,
    root: 'C2',
    midiProgram: 0
}

function loadSettings() {
    const yamlText = document.getElementById("settings").value;
    const userSettings = jsyaml.load(yamlText);
    console.log(userSettings);
    
    for (let setting in userSettings.global) {
        if (!(setting in settings)) {
            console.log(setting, setting in settings);
            return alert(`Unknown setting '${setting}' in global.`);
        } else {
            if (setting == 'generators') {
                settings[setting] = userSettings.global[setting].map((figureName) => classNames[figureName]);
            } else {
                settings[setting] = userSettings.global[setting];
            }
        }
    }

    for (let figure in userSettings.figures) {
        const FigureClass = classNames[figure];
        console.log(FigureClass.settings);
        for (let setting in userSettings.figures[figure]) {
            console.log(setting)
            if (!(setting in FigureClass.settings)) {
                return alert(`Unkown setting ${setting} for figure ${figure}.`);
            } else {
                if (setting == 'intervals') {
                    FigureClass.settings[setting] = scales[userSettings.figures[figure][setting]];
                } else {
                    FigureClass.settings[setting] = userSettings.figures[figure][setting];
                }
            }
        }
    }

    console.log("Saved settings");
    localStorage.setItem("settings", yamlText);
}



WebMidi.enable()
    .then(onEnabled)

function onEnabled() {
    WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));
    // TODO: write these outputs to a DIV
}

function onPageLoaded() {
    const storedSettings = localStorage.getItem("settings")
    console.log(storedSettings);
    if (storedSettings) {
        document.getElementById("settings").innerHTML = storedSettings;
    }
}

window.onload = () => {
    onPageLoaded();
}

function start() {
    loadSettings();
    console.log(settings);

    const main = new Main(WebMidi.time);
    main.runUI();

    main.queueIntroSticks();
    for (let i = 0; i < settings.amountOfFigures; i++) {
        main.queueMeasure();
    }
}