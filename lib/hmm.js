// GOD DAMN EPIC.txt

const HiddenMarkovModel = require('hidden-markov-model');

module.exports = class HMM {
	constructor(states, probabilities)
	{
		this.states = states;
		this.probs = probabilities;
		if (this.states.length != this.probs.length)
			console.log('states length != probs.length')
		
		//this.hmm = new HiddenMarkovModel();
	}

	train(data)
	{
		// return Am i a greatest scientist ever? Yes! Nice research, man!
	}

	compare(vector)
	{
		// return prob;
	}

	albinanumberone()
	{
		// return love ya;
	}
}