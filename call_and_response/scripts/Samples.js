const filenames = ["closed_hat.wav", "open_hat.wav", "sticks.wav"];

const players = filenames.reduce((acc, filename) => {
    const sampleName = filename.split('.')[0];
    const player = new Tone.Player(`resources/${filename}`).toDestination();
    player.autostart = false;
    if (player) {
        acc[sampleName] = player;
    }
    return acc;
}, {});

function scheduleSample(sampleName, timeInSeconds) {
    const player = players[sampleName];
    if (!player) {
        console.log(`Sample ${sampleName} not found`);
        return;
    }

    var eventID = Tone.Transport.scheduleOnce((time) => {
    
        if (!player.loaded) {
            console.log(`Sample ${sampleName} not loaded yet`);
            return;
        }
        player.start(time);
    }, timeInSeconds);

}

