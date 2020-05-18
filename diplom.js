let decode = require('./lib/audiodecoder.js');
const kmeans = require('./lib/kmeans.js');
const trainModels = require('./lib/models.js');
let {hmm, train, recognize} = require('./lib/hmmusage.js');

const fs = require('fs');

async function getTrainedModels()
{
    let signal = [];
    let counter = [];
    let folders = fs.readdirSync('./data/phonemes/th/');
    let currentStart = 0;
    for (let i of folders)
    {
        if (i == '.DS_Store')
            continue;
        counter.push({'key': i, 'start': currentStart, 'end': currentStart});
        let folder = fs.readdirSync('./data/phonemes/th/' + i);
        for (let j of folder)
        {
            if (j == '.DS_Store')
                continue;
            counter[counter.length-1]['end']++;
            currentStart++;
            console.log(j + '\n');
            signal.push(await(decode('./data/phonemes/th/' + i + '/' + j)));
        }
    }

    let test = [];
    for (let i = 0; i < signal.length; i++)
        for (let j of signal[i])
    	   test.push(j);

    let clusters = {};
    clusters = await kmeans(test);

    let models = trainModels(clusters, signal, counter);
    testModels(models, clusters, counter);
}

async function testModels(models, clusters, counter)
{
    let signal = await(decode('./data/phonemes/second/г’/г’18.wav'));
    let probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(г.) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(15) + '%');

    // signal = await(decode('./data/phonemes/second/и/и2.wav'));
    // probs = recognize(models, clusters, signal);
    // for (let i = 0; i < probs.length; i++)
    //     console.log('(и) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(15) + '%');

    signal = await(decode('./data/phonemes/first/а/а26.wav'));
    probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(а) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(15) + '%');
}

getTrainedModels();