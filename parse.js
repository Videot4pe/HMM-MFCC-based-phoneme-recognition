const readline = require("readline");
const ffmpeg = require('ffmpeg');
const fs = require('fs');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Audiofile: ", function(audio) {
    rl.question("Json: ", function(info) {
    	getPhonemes(audio, info);
    	//getWords(audio, info);
    	//getSentences(audio, info);
        rl.close();
    });
});

function getPhonemes(audio, info)
{
	let counter = 0;
	if (!fs.existsSync('./data/phonemes/' + audio))
		fs.mkdirSync('./data/phonemes/' + audio);
	let rawdata = fs.readFileSync('./data/jsons/' + info + '.json');
	let obj = JSON.parse(rawdata);
	for (let i = 0; i < obj.phonemes.length; i++)
	{
		let ph = obj.phonemes[i];
		if (!fs.existsSync('./data/phonemes/' + audio + '/' + ph.notation + '/'))
		    fs.mkdirSync('./data/phonemes/' + audio + '/' + ph.notation + '/');
		let files = fs.readdirSync('./data/phonemes/' + audio + '/' + ph.notation + '/');
		let command = "ffmpeg -i ./data/audiofiles/" + audio + ".wav -acodec copy -ss " + ph.start + " -to " + ph.end + " ./data/phonemes/" + audio + '/' + ph.notation + '/' + ph.notation + counter + ".wav";
		counter++;
		let stdout = execSync(command);
		//console.log(stdout);
	}
}

function getWords(audio, info)
{
	let counter = 0;
	if (!fs.existsSync('./data/words/' + audio))
		fs.mkdirSync('./data/words/' + audio);
	let rawdata = fs.readFileSync('./data/jsons/' + info + '.json');
	let obj = JSON.parse(rawdata);
	for (let i = 0; i < obj.words.length; i++)
	{
		let wd = obj.words[i];
		if (!fs.existsSync('./data/words/' + audio + '/' + wd.value + '/'))
		    fs.mkdirSync('./data/words/' + audio + '/' + wd.value + '/');
		let files = fs.readdirSync('./data/words/' + audio + '/' + wd.value  + '/');
		let command = "ffmpeg -i ./data/audiofiles/" + audio + ".wav -acodec copy -ss " + wd.start + " -to " + wd.end + " ./data/words/" + audio + '/' + wd.value + counter + ".wav";
		counter++;
		let stdout = execSync(command);
		//console.log(stdout);
	}
}

function getSentences(audio, info)
{
	let counter = 0;
	if (!fs.existsSync('./data/sentences/' + audio))
		fs.mkdirSync('./data/sentences/' + audio);
	let rawdata = fs.readFileSync('./data/jsons/' + info + '.json');
	let obj = JSON.parse(rawdata);
	for (let i = 0; i < obj.sentences.length; i++)
	{
		let st = obj.sentences[i];
		if (!fs.existsSync('./data/sentences/' + audio + '/' + st.value + '/'))
		    fs.mkdirSync('./data/sentences/' + audio + '/' + st.value + '/');
		let files = fs.readdirSync('./data/sentences/' + audio + '/' + st.value + '/');
		let command = "ffmpeg -i ./data/audiofiles/" + audio + ".wav -acodec copy -ss " + st.start + " -to " + st.end + " ./data/sentences/" + audio + '/' + st.value + counter + ".wav";
		counter++;
		let stdout = execSync(command);
		//console.log(stdout);
	}
}

rl.on("close", function() {
	console.log('Ez game.');
    process.exit(0);
});
