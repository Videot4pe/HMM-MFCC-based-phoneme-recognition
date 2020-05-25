let {hmm, train} = require('./hmmusage.js');
const fs = require('fs');

module.exports = function trainModels(res, sequences, counter)
{
	let models = {};
	for (let i = 0; i < counter.length; i++)
		models[counter[i]['key']] = hmm();
	//console.log(models);
	for (let i = 0; i < counter.length; i++)
		for (let j = counter[i]['start']; j < counter[i]['end']; j++)
			models[counter[i]['key']] = train(models[counter[i]['key']], res, sequences[j], j);

	//console.log(JSON.stringify(models['а']));
	fs.writeFileSync('./models/clusters.json', JSON.stringify(res) , 'utf-8');
	fs.writeFileSync('./models/model.json', JSON.stringify(models) , 'utf-8');
	fs.writeFileSync('./models/counter.json', JSON.stringify(counter) , 'utf-8');

	console.log('Done!');
	return models;
}