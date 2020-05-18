const WaveFile = require('wavefile').WaveFile;
let getMfcc = require('./mfcc.js');
const fs = require('fs');

module.exports = async function decode(path)
{
    let wav = new WaveFile(fs.readFileSync(path));
    wav.toSampleRate(44100);
    let wavBuffer = wav.toBuffer();
    let signal = Array.from(wavBuffer);
    let mfccSignal = await(getMfcc(signal));
    return mfccSignal;
}
