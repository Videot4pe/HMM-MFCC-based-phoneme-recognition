let {hmm, train} = require('./hmmusage.js');
let HMM = require('./hmm.js');

const fs = require('fs');

function trainModels(res, sequences, counter)
{
	let models = {};
	for (let i = 0; i < counter.length; i++)
		models[counter[i]['key']] = new HMM(700);
	//console.log(models);
	for (let i = 0; i < counter.length; i++)
		for (let j = counter[i]['start']; j < counter[i]['end']; j++)
		{
			//console.log(counter[i]['key']);
			models[counter[i]['key']].train(res, sequences[j], j);
			//models[counter[i]['key']].train(res, sequences[j], j);
			//models[counter[i]['key']].train(res, sequences[j], j);
			// models[counter[i]['key']].train(res, sequences[j], j);
			// models[counter[i]['key']].train(res, sequences[j], j);
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
	//console.log('seq: ', sequenceId);
	for (let i = 0; i < Object.keys(models).length; i++)
	{
		//console.log(models[Object.keys(models)[i]]);

		// for (let j = 0; j < sequenceId.length; j++)
		// 	for (let k = j + 2; k < sequenceId.length+1; k++)
		// 		console.log('from ', j, 'to ', k, 'prob = ', models[Object.keys(models)[i]].forward(sequenceId.slice(j, k)).prob);
		probs.push(models[Object.keys(models)[i]].forward(sequenceId));
	}

	return probs;
}

function recognizzzer(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());

	let path = {};
	path['path'] = recursRecognizzzer(models, kmeans, sequenceId, 0, 1, '');
	
	//console.log(path);
	return path;
}

function recursRecognizzzer(models, kmeans, sequenceId, j, prob, pth)
{
	let path = {};
	//console.log('recurs: ', j);
	let o = [];
	let max = [];
	for (let i = 0; i < Object.keys(models).length; i++)
	{
		let currentProb = 0;
		//o.push(j);
		max.push(0);
		for (let k = j + 2; k < sequenceId.length+1; k++)
		{
			currentProb = models[Object.keys(models)[i]].forward(sequenceId.slice(j, k)).prob;
			//console.log(j, k);
			if (k == sequenceId.length)
			{
				path[Object.keys(models)[i]] = {};
				path[Object.keys(models)[i]]['prob'] = currentProb * prob;
				path[Object.keys(models)[i]]['pth'] = pth + Object.keys(models)[i];
				path[Object.keys(models)[i]]['path'] = 'end';
				break;
			}
			if (currentProb > max[i])
				max[i] = currentProb;
			else
			{
				if (k == sequenceId.length-1)
				{
					path[Object.keys(models)[i]] = {};
					path[Object.keys(models)[i]]['prob'] = max[i] * prob;
					path[Object.keys(models)[i]]['pth'] = pth + Object.keys(models)[i];
					path[Object.keys(models)[i]]['path'] = 'end';
				}
				else
				{
					path[Object.keys(models)[i]] = {};
					path[Object.keys(models)[i]]['prob'] = max[i] * prob;
					path[Object.keys(models)[i]]['pth'] = pth + Object.keys(models)[i];
					path[Object.keys(models)[i]]['path'] = recursRecognizzzer(models, kmeans, sequenceId, k, max[i] * prob, pth + Object.keys(models)[i]);
				}
				break;
			}
		}
	}
	return path;
	// let index = findMax(max);
	// j = o[index];
	// //console.log('j: ', j);
	// console.log('step: ', Object.keys(models)[index]);
}

function findMax(p)
{
	let max = 0;
	let index = 0;
	for (let i = 0; i < p.length; i++)
		if (p[i] > max)
		{
			max = p[i];
			index = i;
		}
	return index;
}

module.exports = {
    trainModels: trainModels,
    recognize: recognize,
    recognizzzer: recognizzzer,
};