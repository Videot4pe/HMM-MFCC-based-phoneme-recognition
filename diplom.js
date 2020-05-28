let decode = require('./lib/audiodecoder.js');
const kmeans = require('./lib/kmeans.js');
const {trainModels, recognize, recognizzzer, linearRecognize} = require('./lib/models.js');
let {hmm, train} = require('./lib/hmmusage.js');
let HMM = require('./lib/hmm.js');
const fs = require('fs');

let probsAll = [];
async function getTrainedModels()
{
	let signal = [];
	let counter = [];
	let folders = fs.readdirSync('./data/phonemes/glav/');
	let currentStart = 0;
	for (let i of folders)
	{
		if (i == '.DS_Store')
			continue;
		counter.push({'key': i, 'start': currentStart, 'end': currentStart});
		let folder = fs.readdirSync('./data/phonemes/glav/' + i);
		for (let j of folder)
		{
			if (j == '.DS_Store')
				continue;
			counter[counter.length-1]['end']++;
			currentStart++;
			//console.log(j + '\n');
			signal.push(await(decode('./data/phonemes/glav/' + i + '/' + j)));
		}
		console.log(i + '\n');
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

async function getModelsDone()
{
	let restored = restoreModel();
	testModels(restored['models'], restored['res'], restored['counter']);
}

function restoreModel()
{
	let rawdata = fs.readFileSync('./models/model.json');
	let data = JSON.parse(rawdata);
	rawdata = fs.readFileSync('./models/clusters.json');
    clusters = JSON.parse(rawdata);
    const skmeans = require("skmeans");
    let res = skmeans([1], 1);
    res['it'] = clusters['it'];
    res['k'] = clusters['k'];
    res['idxs'] = clusters['idxs'];
    res['centroids'] = clusters['centroids'];
    rawdata = fs.readFileSync('./models/counter.json');
    counter = JSON.parse(rawdata);

	let models = {};

	for (let i = 0; i < counter.length; i++)
	{
		models[counter[i]['key']] = new HMM(700);
		models[counter[i]['key']].emissionProbs = data[counter[i]['key']].emissionProbs;
		models[counter[i]['key']].transitionProbs = data[counter[i]['key']].transitionProbs;
		models[counter[i]['key']].initProbs = data[counter[i]['key']].initProbs;
		models[counter[i]['key']].obs = data[counter[i]['key']].obs;
		models[counter[i]['key']].states = data[counter[i]['key']].states;
	}
    return {'models': models,'res': res,'counter': counter};
}

async function testModels(models, clusters, counter)
{
	let folder = fs.readdirSync('./data/phonemes/test/');
	// for (let j of folder)
	// {
	// 	if (j == '.DS_Store')
	// 		continue;
		
	// 	let signal = (await(decode('./data/phonemes/test/' + j)));
	// 	let probs = linearRecognize(models, clusters, signal);
	// 	let index = soWhatIs(probs);
	// 	console.log('(' + j + ') Final probability of ' + index.path + ' = ' + 100 * index.prob.toFixed(5) + '%');
	// }

	for (let j of folder)
	{
		if (j == '.DS_Store')
			continue;
		
		let signal = (await(decode('./data/phonemes/test/' + j)));
		let probs = recognizzzer(models, clusters, signal);
		parseProbz(probs, models);
		printMaxProb(j);
	}
}

function printMaxProb(j)
{
	let max = 0;
	let string = '';

	for (let i = 0; i < probsAll.length; i++)
	{
		if (probsAll[i].prob > max)
		{
			max = probsAll[i].prob;
			string = probsAll[i].pth;
		}
	}
	console.log('(' + j + ') Final probability of ' + string + ' = ' + (100 * max).toFixed(15) + '%');
	probsAll = [];
}

function parseProbz(probz, models)
{
	let path = parse(probz['path'], models);
}

function parse(probz, models)
{	
	let path = [];
	for (let i = 0; i < Object.keys(models).length; i++)
	{
		if (probz[Object.keys(models)[i]]['path'] == 'end')
		{
			probsAll.push({'pth': probz[Object.keys(models)[i]]['pth'], 'prob': probz[Object.keys(models)[i]]['prob']});
			path.push({'pth': probz[Object.keys(models)[i]]['pth'], 'prob': probz[Object.keys(models)[i]]['prob']});
		}
		else
			path.push(parse(probz[Object.keys(models)[i]]['path'], models));
	}
	return path;
}

function soWhatIsRecurs(probs)
{
	let max = 0;
	let currentModel = 0;
	for (let i = 0; i < probs.length; i++)
		if (max < probs[i].prob)
		{
			max = probs[i].prob;
			currentModel = i;
		}
	return currentModel;
}

function soWhatIs(probs)
{
	let currentModel = '';
	let maxProb = 1;
	for (let i = 0; i < probs.length; i++)
	{
		let max = 0;
		let currentMax = '';
		for (let j = 0; j < probs[i].length; j++)
		{
			if (max < probs[i][j]['prob'])
			{
				max = probs[i][j]['prob'];
				currentMax = probs[i][j]['model'];
			}
		}
		currentModel += currentMax;
		maxProb = maxProb * max;
	}
	return {'path': currentModel, 'prob': maxProb};
}

function main()
{
	let myArgs = process.argv.slice(2);
	if (myArgs[0] == 'train')
		getTrainedModels();
	else
		getModelsDone();
}

main();
//getModelsDone();
//getTrainedModels();