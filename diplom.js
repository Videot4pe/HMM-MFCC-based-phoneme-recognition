let decode = require('./lib/audiodecoder.js');
const kmeans = require('./lib/kmeans.js');
const {trainModels, recognize} = require('./lib/models.js');
let {hmm, train} = require('./lib/hmmusage.js');
let HMM = require('./lib/hmm.js');
const fs = require('fs');

async function getTrainedModels()
{
	let signal = [];
	let counter = [];
	let folders = fs.readdirSync('./data/phonemes/Аудиозапись20/');
	let currentStart = 0;
	for (let i of folders)
	{
		if (i == '.DS_Store')
			continue;
		counter.push({'key': i, 'start': currentStart, 'end': currentStart});
		let folder = fs.readdirSync('./data/phonemes/Аудиозапись20/' + i);
		for (let j of folder)
		{
			if (j == '.DS_Store')
				continue;
			counter[counter.length-1]['end']++;
			currentStart++;
			//console.log(j + '\n');
			signal.push(await(decode('./data/phonemes/Аудиозапись20/' + i + '/' + j)));
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
	let signal = await(decode('./data/phonemes/Аудиозапись20/а/а869.wav'));
	let probs = recognize(models, clusters, signal);
	let index = soWhatIs(probs);
	for (let i = 0; i < probs.length; i++)
		console.log('(а) Probability of ' + counter[i]['key'] + ' = ' + probs[i].prob.toFixed(30) + '%');
	//console.log('(а) Probability of ' + counter[index]['key'] + ' = ' + probs[index].prob.toFixed(15) + '%');

	signal = await(decode('./data/phonemes/Аудиозапись20/а/а6.wav'));
	probs = recognize(models, clusters, signal);
	index = soWhatIs(probs);
	for (let i = 0; i < probs.length; i++)
		console.log('(а) Probability of ' + counter[i]['key'] + ' = ' + probs[i].prob.toFixed(30) + '%');
	//console.log('(а) Probability of ' + counter[index]['key'] + ' = ' + probs[index].prob.toFixed(15) + '%');

	signal = await(decode('./data/phonemes/Аудиозапись20/в/в653.wav'));
	probs = recognize(models, clusters, signal);
	index = soWhatIs(probs);
	for (let i = 0; i < probs.length; i++)
		console.log('(в) Probability of ' + counter[i]['key'] + ' = ' + probs[i].prob.toFixed(30) + '%');
	//console.log('(в) Probability of ' + counter[index]['key'] + ' = ' + probs[index].prob.toFixed(15) + '%');

	signal = await(decode('./data/phonemes/Аудиозапись20/и/и141.wav'));
	probs = recognize(models, clusters, signal);
	index = soWhatIs(probs);
	for (let i = 0; i < probs.length; i++)
		console.log('(и) Probability of ' + counter[i]['key'] + ' = ' + probs[i].prob.toFixed(30) + '%');
	//console.log('(и) Probability of ' + counter[index]['key'] + ' = ' + probs[index].prob.toFixed(15) + '%');
}

function soWhatIs(probs)
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

getTrainedModels();