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

function recognize(models, kmeans, sequence)
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

function linearRecognize(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());
	let path = [];

	for (let j = 0; j < sequenceId.length; j++)
	{
		let phoneme = [];
		for (let i = 0; i < Object.keys(models).length; i++)
		{
			let currentProb = 0;
			let max = 0;
			for (let k = j + 3; k < sequenceId.length+1; k++)
			{
				currentProb = models[Object.keys(models)[i]].forward(sequenceId.slice(j, k)).prob;
				if (k == sequenceId.length)
				{
					phoneme.push({'model': Object.keys(models)[i], 'k': k, 'prob': currentProb});
					break;
				}
				if (currentProb > max)
					max = currentProb;
				else
				{
					phoneme.push({'model': Object.keys(models)[i], 'k': k, 'prob': max});
					break;
				}
			}
		}
		j = findMaxIndex(phoneme);
		path.push(phoneme);
	}
	return path;
}

function recogniz(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());
	let path = [];

	for (let j = 0; j < sequenceId.length-5; j++)
	{
		let phoneme = [];
		for (let k = j + 5; k < j + 9; k++)
		{
			for (let i = 0; i < Object.keys(models).length; i++)
				phoneme.push({'j': j, 'k': k, 'model': Object.keys(models)[i], 'prob': models[Object.keys(models)[i]].forward(sequenceId.slice(j, k)).prob});
		}
		path.push(phoneme);
	}
	//console.log(path[0]);
	//path = path[0];
	let maxProb = [];
	for (let i = 0; i < path.length; i++)
	{
		let max = 0;
		let obj = {};
		for (let j = 0; j < path[i].length; j++)
		{
			if (path[i][j].prob > max)
			{
				console.log(path[i][j]);
				max = path[i][j].prob;
				obj = path[i][j];
			}
		}
		maxProb.push(obj);
	}
	//console.log(maxProb);
	let result = '';
	let prev = 0;
	for (let i = 0; i < maxProb.length - 1; i++)
	{
		//console.log(maxProb[i].k, prev);
		if (maxProb[i].j >= prev-1)
		{
			prev = maxProb[i].k;
			result += maxProb[i].model;
		}
	}
	//console.log(result);
	return result;
}

function findMaxIndex(phoneme)
{
	let max = 0;
	let maxIndex = 0;
	for (let i = 0; i < phoneme.length; i++)
		if (phoneme[i]['prob'] > max)
		{
			max = phoneme[i]['prob'];
			maxIndex = phoneme[i]['k'];
		}
	return maxIndex;	
}

function recognizzzer(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());

	let path = [];

	let i = 0;
	// for (i; i+10 < sequenceId.length; i += 10)
	// {
	// 	path.push({});
	// 	path[path.length - 1]['path'] = recursRecognizzzer(models, kmeans, sequenceId.slice(i, i+10), 0, 1, '');
	// }
	path.push({});
	path[path.length - 1]['path'] = recursRecognizzzer(models, kmeans, sequenceId.slice(i, sequenceId.length), 0, 1, '');
	
	return path;
}

function recursRecognizzzer(models, kmeans, sequenceId, j, prob, pth)
{
	let path = {};
	let o = [];
	let max = [];
	for (let i = 0; i < Object.keys(models).length; i++)
	{
		let currentProb = 0;
		let currentProbLeft = 0;
		let currentProbRight = 0;
		max.push(0);
		for (let k = j + 2; k < sequenceId.length + 1; k++)
		{
			currentProb = models[Object.keys(models)[i]].forward(sequenceId.slice(j, k)).prob;
			if (j > 0)
				currentProbLeft = models[Object.keys(models)[i]].forward(sequenceId.slice(j-1, k)).prob;
			currentProbRight = models[Object.keys(models)[i]].forward(sequenceId.slice(j+1, k)).prob;

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
			else if (currentProbLeft > max[i])
				max[i] = currentProbLeft;
			else if (currentProbRight > max[i])
				max[i] = currentProbRight;
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
		//path = cutPath(path);
	}
	return path;
}

function cutPath(path)
{
	let max = [0, 0, 0];
	let index = [0, 0, 0];
	// for (let i = 0; i < path.length)
	// {
	// 	if (path[i]['prob'] > max[0])
	// 	{
	// 		let tmp = max[0];
	// 		let tmpIndex = index[0];
	// 		max[0] = path[i]['prob']
	// 		index[0] = i;
	// 		if (tmp > max[1])
	// 		{
	// 			let tmp1 = max[1];
	// 			let tmpIndex1 = index[1];
	// 			max[1] = tmp;
	// 			index[1] = tmpIndex;
	// 			if (tmp1 > max[2])
	// 			{
	// 				max[2] = tmp1;
	// 				index[2] = tmpIndex1;
	// 			}
	// 		}
	// 		else if (tmp > max[2])
	// 		{
	// 			let tmp1 = max[2];
	// 			let tmpIndex1 = index[2];
	// 			max[2] = tmp;
	// 			index[2] = tmpIndex;
	// 			if (tmp1 > max[1])
	// 			{
	// 				max[1] = tmp1;
	// 				index[1] = tmpIndex1;
	// 			}
	// 		}
	// 	}
	// 	else if ()
	// }
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
	recogniz: recogniz,
    trainModels: trainModels,
    recognize: recognize,
    recognizzzer: recognizzzer,
    linearRecognize: linearRecognize,
};