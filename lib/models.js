let {hmm, train} = require('./hmmusage.js');
let HMM = require('./hmm.js');

const fs = require('fs');

function trainModels(res, sequences, counter)
{
	let models = {};
	for (let i = 0; i < counter.length; i++)
		models[counter[i]['key']] = new HMM(250);
	//console.log(models);
	for (let i = 0; i < counter.length; i++)
		for (let j = counter[i]['start']; j < counter[i]['end']; j++)
		{
			console.log(counter[i]['key']);
			models[counter[i]['key']].train(res, sequences[j], j);
			models[counter[i]['key']].train(res, sequences[j], j);
			models[counter[i]['key']].train(res, sequences[j], j);

		}

	//console.log(JSON.stringify(models['а']));
	fs.writeFileSync('./models/clusters.json', JSON.stringify(res) , 'utf-8');
	fs.writeFileSync('./models/model.json', JSON.stringify(models) , 'utf-8');
	fs.writeFileSync('./models/counter.json', JSON.stringify(counter) , 'utf-8');

	console.log('Done!');
	return models;
}

function recognize(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());
	let probs = [];

	for (let i = 0; i < Object.keys(models).length; i++)
		probs.push(models[Object.keys(models)[i]].forward(sequenceId));

	return probs;
}

module.exports = {
    trainModels: trainModels,
    recognize: recognize,
};