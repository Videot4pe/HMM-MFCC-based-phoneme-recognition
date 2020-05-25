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
    console.log('test');
    let clusters = {};
    //console.log(JSON.stringify(test));
    clusters = await kmeans(test);
    console.log('clusters');
    //console.log(JSON.stringify(clusters));
    let models = trainModels(clusters, signal, counter);
    console.log('models');
    testModels(models, clusters, counter);
}

async function testModels(models, clusters, counter)
{
    let signal = await(decode('./data/phonemes/second/а/а73.wav'));
    let probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(а) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(30) + '%');

    signal = await(decode('./data/phonemes/second/а/а96.wav'));
    probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(а) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(30) + '%');

    signal = await(decode('./data/phonemes/second/б’/б’541.wav'));
    probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(б’) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(30) + '%');

    signal = await(decode('./data/phonemes/th/а/а65.wav'));
    probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(а) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(30) + '%');
}

getTrainedModels();