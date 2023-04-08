// Click tracks and drum rythms and tempo/time methods
// https://soundprogramming.net/file-formats/general-midi-drum-note-numbers/

function noteDuration(noteValue) {
    const wholeNotesPerMinute = settings.tempo / 4;
    const wholeNotesPerSecond = wholeNotesPerMinute / 60;
    const millisPerWholeNote = 1000 / wholeNotesPerSecond;
    return millisPerWholeNote * noteValue;
}

function measureToTime(measure) {
    return noteDuration(whole) * measure;
}

function metronome(measures, beatsPerBar, beatLength) {
    const ticks = []
    let time = 0;
    for (let measure = 0; measure < measures; measure++) {
        for (let beat = 0; beat < beatsPerBar; beat++) {
            const midiValue = beat == 0 ? 42 : 44;
            const tick = {
                midiValue: midiValue,
                time: Math.round(time)
            };
            ticks.push(tick);
            time += noteDuration(beatLength);
        }
    }
    return ticks;
}