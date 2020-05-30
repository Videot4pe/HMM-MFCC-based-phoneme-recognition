const fs = require('fs');

(() => {
	let audio = fs.readdirSync('./data/phonemes/');

	let stat = {};
	let counter = 0;
	let eachPhoneme = {};

    for (let i of audio)
    {
    	if (i == '.DS_Store')
    		continue;
    	if (!stat.hasOwnProperty(i))
    		stat[i] = {};

    	let phonemes = fs.readdirSync('./data/phonemes/samples/');

    	for (let j of phonemes)
    	{
            if (j == '.DS_Store')
                continue;
    		if (!stat[i].hasOwnProperty(j))
    			stat[i][j] = 0;

    		if (!eachPhoneme.hasOwnProperty(j))
    			eachPhoneme[j] = 0;

    		let samples = fs.readdirSync('./data/phonemes/samples/' + j);
	        for (let k of samples)
	        {
    			stat[i][j]++;
	        	counter++;
	            eachPhoneme[j]++;
	        }
    	}
	}
	stat = {audios: stat, phonemes: {eachPhoneme: eachPhoneme, count: counter}};
	fs.writeFileSync('./data/statsPhonemes.json', JSON.stringify(stat) , 'utf-8');
	console.log(stat);
})();

// (() => {
//     let audio = fs.readdirSync('./data/words/');

//     let stat = {};
//     let counter = 0;
//     let eachWord = {};

//     for (let i of audio)
//     {
//         if (i == '.DS_Store')
//             continue;
//         if (!stat.hasOwnProperty(i))
//             stat[i] = {};

//         let words = fs.readdirSync('./data/words/' + i);

//         for (let j of words)
//         {
//             if (j == '.DS_Store')
//                 continue;
//             if (!stat[i].hasOwnProperty(j))
//                 stat[i][j] = 0;

//             if (!eachWord.hasOwnProperty(j))
//                 eachWord[j] = 0;

//             let samples = fs.readdirSync('./data/words/' + i + '/' + j);
//             for (let k of samples)
//             {
//                 stat[i][j]++;
//                 counter++;
//                 eachWord[j]++;
//             }
//         }
//     }
//     stat = {audios: stat, words: {eachWord: eachWord, count: counter}};
//     fs.writeFileSync('./data/statsWords.json', JSON.stringify(stat) , 'utf-8');
//     console.log(stat);
// })();

// (() => {
//     let audio = fs.readdirSync('./data/sentences/');

//     let stat = {};
//     let counter = 0;
//     let eachSentence = {};

//     for (let i of audio)
//     {
//         if (i == '.DS_Store')
//             continue;
//         if (!stat.hasOwnProperty(i))
//             stat[i] = {};

//         let sentences = fs.readdirSync('./data/sentences/' + i);

//         for (let j of sentences)
//         {
//             if (j == '.DS_Store')
//                 continue;
//             if (!stat[i].hasOwnProperty(j))
//                 stat[i][j] = 0;

//             if (!eachSentence.hasOwnProperty(j))
//                 eachSentence[j] = 0;

//             let samples = fs.readdirSync('./data/sentences/' + i + '/' + j);
//             for (let k of samples)
//             {
//                 stat[i][j]++;
//                 counter++;
//                 eachSentence[j]++;
//             }
//         }
//     }
//     stat = {audios: stat, sentences: {eachSentence: eachSentence, count: counter}};
//     fs.writeFileSync('./data/statSentences.json', JSON.stringify(stat) , 'utf-8');
//     console.log(stat);
// })();