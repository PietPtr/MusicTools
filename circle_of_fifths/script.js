const keys = ["A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D"];
let intervalId = null;
let currentKeyIndex = 9;
let beatCount = 0;

function setupCircleOfFifths() {
    const container = document.getElementById('circleOfFifths');
    keys.forEach(key => {
        const div = document.createElement('div');
        div.classList.add('key');
        div.textContent = key;
        container.appendChild(div);
    });
}

function updateKeyHighlight() {
    const keyElements = document.querySelectorAll('.key');
    keyElements.forEach((el, index) => {
        if (index === currentKeyIndex) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function beep(soundName) {
    const sound = document.getElementById(soundName);
    sound.currentTime = 0;
    sound.play();
}

function metronomeTick() {
    updateKeyHighlight();

    console.log(beatCount, keys[currentKeyIndex]);
    if (beatCount % 4 == 0) {
        beep('tick_accent');
    } else {
        beep('tick');
    }
    beatCount++;

    const measuresPerChange = parseInt(document.getElementById('measures').value, 10);

    if (beatCount / 4 >= measuresPerChange) {
        const direction = parseInt(document.getElementById('direction').value, 10);
        currentKeyIndex = (currentKeyIndex + direction + keys.length) % keys.length;
        beatCount = 0;
    }
}

function startMetronome() {
    const bpm = parseInt(document.getElementById('bpm').value, 10);
    if (intervalId !== null) {
        clearInterval(intervalId);
    }
    const intervalTime = 60000 / bpm;
    intervalId = setInterval(metronomeTick, intervalTime);
}

function stopMetronome() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

setupCircleOfFifths();
updateKeyHighlight();
