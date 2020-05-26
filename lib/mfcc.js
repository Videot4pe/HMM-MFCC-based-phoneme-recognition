const fftjs = require('fft-js'); // is dependency
const {framer, mfcc} = require('sound-parameters-extractor');
const kmeans = require('./kmeans.js');

module.exports = async function getMfcc(signal)
{
    //console.log(JSON.stringify(signal));
    const config = {
        fftSize: 2048,
        //fftSize: 4096,
        //fftSize: 8192,
        bankCount: 26,
        lowFrequency: 1,
        highFrequency: 44100/4,
        sampleRate: 44100
    };

    //const windowSize = 4096*2
    const windowSize = 2048*2;
    const overlap = '50%';
    const mfccSize = 16;

    const framedSignal = framer(signal, windowSize, overlap);

    const mfccMatrix = mfcc.construct(config, mfccSize);
    //console.log(mfccMatrix);
    const mfccSignal = framedSignal.map(window => {
        const phasors = fftjs.fft(window);
        return mfccMatrix(fftjs.util.fftMag(phasors));
    });
    //console.log(JSON.stringify(mfccSignal));

    return mfccSignal;
}