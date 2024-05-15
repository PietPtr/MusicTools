// Intervals and scales as convenient names;

const unison = 0;
const minor2nd = 1;
const major2nd = 2;
const minor3rd = 3;
const major3rd = 4;
const fourth = 5;
const augmented4th = 6;
const tritone = 6;
const diminished5th = 6;
const fifth = 7;
const minor6th = 8;
const major6th = 9;
const minor7th = 10;
const major7th = 11;
const octave = 12;

const majorScaleConstruction = [2, 2, 1, 2, 2, 2, 1];
const major = [unison, major2nd, major3rd, fourth, fifth, major6th, major7th, octave];
const major_pentatonic = [unison, major2nd, major3rd, fifth, major6th, octave];
const minor = [unison, minor3rd, fourth, fifth, minor7th, octave];
const minor_pentatonic = [unison, major2nd, minor3rd, fourth, fifth, minor6th, minor7th, octave];
const chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const dorian = scanl(plus, 0, rotateArray(majorScaleConstruction, 1));
const phrygian = scanl(plus, 0, rotateArray(majorScaleConstruction, 2));
const lydian = scanl(plus, 0, rotateArray(majorScaleConstruction, 3));
const mixolydian = scanl(plus, 0, rotateArray(majorScaleConstruction, 4));
const aeolian = scanl(plus, 0, rotateArray(majorScaleConstruction, 5));
const locrian = scanl(plus, 0, rotateArray(majorScaleConstruction, 6));

const r45 = [unison, fourth, fifth];

const scales = {
    major: major,
    major_pentatonic: major_pentatonic, // TODO: in A, an F# seems to be played as an F on synth mode
    minor: minor,
    minor_pentatonic: minor_pentatonic,
    chromatic: chromatic,
    dorian: dorian,
    phrygian: phrygian,
    lydian: lydian,
    mixolydian: mixolydian,
    aeolian: aeolian,
    locrian: locrian,
    r45: r45
}

const sixteenth = 1/16;
const eighth = 1/8;
const quarter = 1/4;
const half = 1/2;
const whole = 1;