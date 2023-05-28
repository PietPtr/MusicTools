
class MIDIPlayer {
    constructor() {
        this.output = WebMidi.outputs.filter(output => output.name == settings.activeOutputName)[0];
        this.output.sendProgramChange(settings.midiProgram)
        this.drumChannel = this.output.channels[10];
    }

    now() {
        return WebMidi.time;
    }

    schedule(crnote, playTime) {        
        // const note = new Note(crnote.pitch, {duration: noteDuration(duration), attack: attack});
        this.output.playNote(crnote.webMidiNote, {time: playTime});
    }

    drums(midiNote, playTime) {
        this.drumChannel.playNote(midiNote, {time: playTime, attack: 1});
    }
}

class SynthPlayer {
    constructor() {
        // TODO: set tempo correctly in tone js (default is 120, good enough to test with)
        this.synth = new Tone.Synth().toDestination(); // TODO: fancier synth?
        this.synth.sync();
    }

    now() {
        return Tone.now() * 1000;
    }

    schedule(crnote, playTime) {
        // console.log(`Pitch: ${crnote.fullname()} (${crnote.pitch}) at ${playTime}`);
        this.synth.triggerAttackRelease(crnote.fullname(), noteDuration(crnote.duration) / 1000, playTime / 1000, crnote.attack);
    }

    drums(midiNote, playTime) {
        const sampleMap = {
            31: "sticks",
            42: "open_hat",
            44: "closed_hat",
        }
        if (midiNote in sampleMap) {
            scheduleSample(sampleMap[midiNote], playTime / 1000);
        } else {
            console.log(`Not implemented: SynthPlayer.drums(${midiNote}, ${playTime})`);
        }
    }
}
