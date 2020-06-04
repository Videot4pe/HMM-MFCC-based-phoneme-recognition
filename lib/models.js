let {hmm, train} = require('./hmmusage.js');
let HMM = require('./hmm.js');

const fs = require('fs');

function trainModels(res, sequences, counter)
{
	let models = {};
	for (let i = 0; i < counter.length; i++)
		models[counter[i]['key']] = new HMM(2500);
	for (let i = 0; i < counter.length; i++)
	{
		for (let j = counter[i]['start']; j < counter[i]['end']; j++)
		{
			models[counter[i]['key']].train(res, sequences[j]);
			models[counter[i]['key']].train(res, sequences[j]);
		}
		console.log('Обучена модель ', counter[i]['key'], '.');
	}

	fs.writeFileSync('./models/clusters.json', JSON.stringify(res) , 'utf-8');
	fs.writeFileSync('./models/model.json', JSON.stringify(models) , 'utf-8');
	fs.writeFileSync('./models/counter.json', JSON.stringify(counter) , 'utf-8');

	return models;
}

function recognizePhoneme(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());
	let probs = [];
	for (let i = 0; i < Object.keys(models).length; i++)
		probs.push(models[Object.keys(models)[i]].forward(sequenceId));

	//console.log(probs);
	let max = 0;
	let index = 0;
	for (let i = 0; i < probs.length; i++)
	{
		if (probs[i].prob > max)
		{
			max = probs[i].prob;
			index = i;
		}
	}
	//console.log(index);
	return Object.keys(models)[index];
}

function recognize(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());
	let path = [];

	for (let j = 0; j < sequenceId.length; j++)
	{
		let phoneme = [];

		for (let k = j + 7; k < j + 12; k+=1)
			for (let i = 0; i < Object.keys(models).length; i++)
				phoneme.push({'j': j, 'k': k, 'model': Object.keys(models)[i], 'prob': models[Object.keys(models)[i]].forward(sequenceId.slice(j, k)).prob});
		path.push(phoneme);
	}
	
	let maxProb = [];
	for (let i = 0; i < path.length; i++)
	{
		let max = 0;
		let obj = {};
		for (let j = 0; j < path[i].length; j++)
			if (path[i][j].prob > max)
			{
				max = path[i][j].prob;
				obj = path[i][j];
			}
		maxProb.push(obj);
	}
	let result = '';
	let prev = 0;
	for (let i = 0; i < maxProb.length - 1; i++)
		if (maxProb[i].j >= prev-1)
		{
			prev = maxProb[i].k;
			result += maxProb[i].model;
		}
	return result;
}

module.exports = {
	recognizePhoneme: recognizePhoneme,
    trainModels: trainModels,
    recognize: recognize,
};