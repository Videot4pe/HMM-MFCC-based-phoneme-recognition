const maryMarkov = require('mary-markov');

function hmm()
{
	let hiddenStates = [    
	    {state: 'begin', prob: [0.0, 0.9, 0.1]},    
	    {state: 'mid', prob: [0.0, 0.5, 0.5]},
	    {state: 'end', prob: [0.0, 0.0, 1]},    
	];
	let observables = fill(3);

	let hiddenInit = [1, 0, 0];
	let model = maryMarkov.HMM(hiddenStates, observables, hiddenInit);
	return model;
}

function randombetween(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function fill(a)
{
	let res = [];
	for (let i = 0; i < a; i++)
	{
		var max = 100;
		var r1 = randombetween(0, max);
		var r2 = randombetween(0, max-r1);
		var r3 = max - r1 - r2;
		res.push({obs: i.toString(), prob: [r1/100, r2/100, r3/100]});
	}
	return res;
}

function train(model, kmeans, sequence, count)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());

	//console.log('hey, ', count, '\n');
	console.log('Sequence: ', sequenceId, '\n');
	//console.log('Model: ', model, '\n');

	let maximizedModel = model.baumWelchAlgorithm(sequenceId);
	console.log(maximizedModel);
	return maximizedModel;
}

function recognize(models, kmeans, sequence)
{
	let sequenceId = [];
	for (let i = 0; i < sequence.length; i++)
		sequenceId.push(kmeans.test(sequence[i]).idx.toString());
	let probs = [];
	let c = sequenceId.length;
	// for (let c = 1; c < sequenceId.length; c++)
	// {
		//probs = [];
		for (let i = 0; i < Object.keys(models).length; i++)
		{
			probs.push(models[Object.keys(models)[i]].forwardAlgorithm(sequenceId.slice(0,c)));
		}
		//console.log("amount: ", c, "probs: ", probs);
	//}
	return probs;
}

module.exports = {
    hmm: hmm,
    train: train,
    recognize: recognize,
};