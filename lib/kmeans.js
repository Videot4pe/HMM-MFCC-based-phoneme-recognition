module.exports = async function kmeans(mfccSignal)
{	
	let vectors = new Array();
	for (let i = 0 ; i < mfccSignal.length ; i++) {
		vectors[i] = [mfccSignal[i][0], mfccSignal[i][1], mfccSignal[i][2], mfccSignal[i][3], mfccSignal[i][4], mfccSignal[i][5], mfccSignal[i][6], mfccSignal[i][7], mfccSignal[i][8], mfccSignal[i][9], mfccSignal[i][10], mfccSignal[i][11], mfccSignal[i][12], mfccSignal[i][13], mfccSignal[i][14], mfccSignal[i][15]];
	}

	const skmeans = require("skmeans");
    let res = await skmeans(vectors, 700, "kmpp");
	return res;
}

// function oldKmeans(mfccSignal, sequences)
// {
// 	const kmeans = require('node-kmeans');
// 	kmeans.clusterize(vectors, {k: 6}, (err,res) => {
// 	  if (err) console.error(err);
// 	  else {
// 	  	let models = [];
// 	  	for (let i = 0; i < 2; i++)
// 	  		models.push(hmm());
// 	  	for (let i = 0; i < 2; i++)
// 	  		models[i] = train(models[i], res, sequences[i]);
// 	  	fs.writeFileSync('./models/clusters.json', JSON.stringify(res) , 'utf-8');
// 	  	for (let i = 0; i < 2; i++)
// 	  		fs.writeFileSync('./models/model' + i + '.json', JSON.stringify(models[i]) , 'utf-8');
// 	  	console.log('Done!');
// 	  	//console.log('%o',res);
// 	  }
// 	});
// }