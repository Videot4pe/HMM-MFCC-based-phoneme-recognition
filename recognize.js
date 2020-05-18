let decode = require('./lib/audiodecoder.js');
let {hmm, train, recognize} = require('./lib/hmmusage.js');

const fs = require('fs');
let counter = {};
let models = {};
let clusters = {};

async function main()
{    
    restoreModel();
    let signal = await(decode('./data/phonemes/first/а/а9.wav'));
    let probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(а) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(3) + '%');

    signal = await(decode('./data/phonemes/second/б’/б’10.wav'));
    probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(б.) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(3) + '%');

    signal = await(decode('./data/phonemes/second/в/в0.wav'));
    probs = recognize(models, clusters, signal);
    for (let i = 0; i < probs.length; i++)
        console.log('(в) Probability of ' + counter[i]['key'] + ' = ' + probs[i].alphaF.toFixed(3) + '%');
}

function restoreModel()
{
	let rawdata = fs.readFileSync('./models/model.json');
	models = JSON.parse(rawdata);
	let model = hmm();
	for (let i = 0; i < Object.keys(models).length; i++)
	{
		models[Object.keys(models)[i]].forwardAlgorithm = model.forwardAlgorithm.bind(models[Object.keys(models)[i]]);
		models[Object.keys(models)[i]].backwardAlgorithm = model.backwardAlgorithm;
		models[Object.keys(models)[i]].viterbiAlgorithm = model.viterbiAlgorithm;
		models[Object.keys(models)[i]].bayesTheorem = model.bayesTheorem;
		models[Object.keys(models)[i]].baumWelchAlgorithm = model.baumWelchAlgorithm;
	}

    rawdata = fs.readFileSync('./models/clusters.json');
    clusters = JSON.parse(rawdata);
    const skmeans = require("skmeans");
    let res = skmeans([1], 1);
    clusters.test = res.test;
    rawdata = fs.readFileSync('./models/counter.json');
    counter = JSON.parse(rawdata);
}

main();