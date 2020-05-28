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

	// let m = new HMM(5);
	// //console.log(m);
	// let res = m.forward(['1', '2', '3']);
	// console.log('prob before: ', res.prob);
	// // res = m.backward(['1', '2', '3']);
	// // console.log(res.prob, res.steps);

	// // res = m.posterior(['1', '2', '3']);
	// // console.log(res);
	// //res = m.viterbi(['1', '2', '3']);
	// //console.log(res);
	// res = m.baumWelch(['1', '2', '3']);
	// res = m.baumWelch(['1', '3', '4']);
	// res = m.baumWelch(['0', '2', '1']);
	// res = m.baumWelch(['1', '3', '3', '0']);
	// res = m.forward(['1', '2', '0']);
	// console.log('prob after: ', res.prob);

	// res = m.baumWelch(['1', '2', '2']);
	// res = m.baumWelch(['2', '1', '0']);
	// res = m.baumWelch(['1', '2', '3']);
	// res = m.forward(['1', '2', '3']);
	// console.log('prob after: ', res.prob);
	//console.log(res);

	let test = [];
	for (let i = 0; i < signal.length; i++)
		for (let j of signal[i])
		   test.push(j);

	let clusters = {};
	clusters = await kmeans(test);

	let models = trainModels(clusters, signal, counter);
	//console.log(models);
	testModels(models, clusters, counter);
}

async function testModels(models, clusters, counter)
{
	let folder = fs.readdirSync('./data/phonemes/test/');
	for (let j of folder)
	{
		if (j == '.DS_Store')
			continue;
		
		let signal = (await(decode('./data/phonemes/test/' + j)));
		let probs = linearRecognize(models, clusters, signal);
		let index = soWhatIs(probs);
		// for (let i = 0; i < probs.length; i++)
		// 	console.log('(г) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
		console.log('(' + j + ') Final probability of ' + index.path + ' = ' + 100 * index.prob.toFixed(5) + '%');
	}

	for (let j of folder)
	{
		if (j == '.DS_Store')
			continue;
		
		let signal = (await(decode('./data/phonemes/test/' + j)));
		let probs = recognizzzer(models, clusters, signal);
		//let index = soWhatIsRecurs(probs);
		parseProbz(probs, models);
		printMaxProb();
	}

	// let signal = await(decode('./data/phonemes/Главный.wav'));
	// let probz = linearRecognize(models, clusters, signal);
	// console.log(JSON.stringify(probz));

	// let probs = recognize(models, clusters, signal);
	// let index = soWhatIs(probs);

	// signal = await(decode('./data/phonemes/г.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(г) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(г) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');

	// signal = await(decode('./data/phonemes/glav/г/г24.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(г) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(г) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');

	// signal = await(decode('./data/phonemes/Аудиозапись20/в/в867.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(в) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(в) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');

	// signal = await(decode('./data/phonemes/glav/л/л62.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(л) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(л) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');

	// signal = await(decode('./data/phonemes/glav/н/н12.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(н) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(н) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');

	// signal = await(decode('./data/phonemes/glav/ы/ы685.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(ы) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(ы) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');

	// signal = await(decode('./data/phonemes/glav/й/й’320.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(й) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(й) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');

	// signal = await(decode('./data/phonemes/glav/е/е.wav'));
	// probs = recognize(models, clusters, signal);
	// index = soWhatIs(probs);
	// for (let i = 0; i < probs.length; i++)
	// 	console.log('(е) Probability of ' + counter[i]['key'] + ' = ' + 100 * probs[i].prob.toFixed(5) + '%');
	// console.log('(е) Final probability of ' + counter[index]['key'] + ' = ' + 100 * probs[index].prob.toFixed(5) + '%');
}

function printMaxProb()
{
	let max = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let strings = '';
	let stringss = '';
	let stringsss = '';
	for (let i = 0; i < probsAll.length; i++)
	{
		if (probsAll[i].prob > max[0])
		{
			max[0] = probsAll[i].prob;
			strings = probsAll[i].pth;
		}
		// if (probsAll[i].pth == 'главны')
		// {
		// 	stringss = probsAll[i].pth;
		// 	max[1] = probsAll[i].prob;
		// }
		// if (probsAll[i].pth == 'еглавн')
		// {
		// 	stringsss = probsAll[i].pth;
		// 	max[2] = probsAll[i].prob;
		// }
	}
	console.log(strings, max[0]);
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
	//console.log(probs);

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

getTrainedModels();