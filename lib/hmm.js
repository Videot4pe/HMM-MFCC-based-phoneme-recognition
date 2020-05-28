// GOD DAMN EPIC.txt

const HiddenMarkovModel = require('hidden-markov-model');

module.exports = class HMM {
	constructor(n)
	{
		this.states = ['start', 'mid'];
		//this.endState = 'end';
		this.obs = [...Array(n).keys()];
		this.initProbs = {'start': 0.5, 'mid': 0.5};
		this.transitionProbs = {'start': {'start': 0.1, 'mid': 0.8, 'end': 0.1}, 'mid': {'start': 0, 'mid': 0.7, 'end': 0.3}};
		this.emissionProbs = fillZeros(n);
	}

	forward(obs)
	{
		//console.log(obs);
		let steps = [];
		let previousStep = {};
		let currentStep = {'start': 0, 'mid': 0};
		let alpha = 0;
		for (let i = 0; i < obs.length; i++)
		{
			currentStep = {'start': 0, 'mid': 0};
			for (let j of this.states)
			{
				alpha = 0;
				if (i == 0)
					alpha = this.initProbs[j];
				else
					for (let k of this.states)
						alpha += previousStep[k] * this.transitionProbs[k][j];
				currentStep[j] = this.emissionProbs[obs[i]][this.states.indexOf(j)] * alpha;
			}
			steps.push(currentStep);
			previousStep = currentStep;
		}
		let prob = 0;
		for (let k of this.states)
			prob += currentStep[k] * this.transitionProbs[k]['end'];
		return {'prob': prob, 'steps': steps};
	}	

	backward(obs)
	{
		let steps = [];
		let previousStep = {};
		let currentStep = {'start': 0, 'mid': 0};
		for (let i = obs.length-1; i >-1; i--)
		{
			currentStep = {'start': 0, 'mid': 0};
			for (let j of this.states)
			{
				currentStep[j] = 0;
				if (i == 0)
					currentStep[j] = this.transitionProbs[j]['end'];
				else
					for (let k of this.states)
						currentStep[j] += this.transitionProbs[j][k] * this.emissionProbs[obs[i]][this.states.indexOf(k)]
			}
			steps.unshift(currentStep);
			previousStep = currentStep;
		}
		let prob = 0;
		for (let k of this.states)
			prob += this.initProbs[k] * this.emissionProbs[obs[0]][this.states.indexOf(k)] * previousStep[k];
		return {'prob': prob, 'steps': steps};
	}

	posterior(obs)
	{
		let fwd = this.forward(obs);
		let bwd = this.backward(obs);
		let res = [];
		for (let i = 0; i < obs.length; i++)
			for (let j of this.states)
				res.push({j: fwd.steps[i][j] * bwd.steps[i][j] / fwd.prob});
		return res;
	}

	viterbi(obs)
	{
		let v = [{}];
		for (let i of this.states)
			v[0][i] = {"prob": this.initProbs[i] * this.emissionProbs[obs[0]][this.states.indexOf(i)], "prev": ''};

		for (let t = 1; t < obs.length; t++)
		{
			v.push({});
			for (let i of this.states)
			{
				let max_tr_prob = v[t-1][this.states[0]]["prob"]*this.transitionProbs[this.states[0]][i];
				let prev_st_selected = this.states[0];
				for (let j of this.states.slice(1))
				{
					let tr_prob = v[t-1][j]["prob"]*this.transitionProbs[j][i];
					if (tr_prob > max_tr_prob)
					{
						max_tr_prob = tr_prob;
						prev_st_selected = j;
					}
				}
				let max_prob = max_tr_prob * this.emissionProbs[obs[t]][this.states.indexOf(i)]
				v[t][i] = {"prob": max_prob, "prev": prev_st_selected};
			}
		}

		let opt = [];
		let max_prob = 0.0;
		let previous = '';
		let best_st = '';
		for (let i of Object.entries(v[v.length-1]))
			if (i[1].prob > max_prob)
			{
				max_prob = i[1].prob;
				best_st = i[0];
			}
		opt.push(best_st)
		previous = best_st;


		for (let t = v.length - 2; t > -1; t--)
		{
			opt.unshift(v[t+1][previous].prev);
			previous = v[t + 1][previous]["prev"];
		}	
		return {'steps': opt, 'prob': max_prob};
	}

	baumWelch(obs)
	{
		for (let i = 0; i < obs.length; i++)
			if (this.emissionProbs[obs[i]][0] == 0 && this.emissionProbs[obs[i]][1] == 0 && this.emissionProbs[obs[i]][2] == 0)
				this.emissionProbs[obs[i]] = fill();

		let fwd = this.forward(obs);
		let probFwd = fwd.prob;
		fwd = fwd.steps;
		let bwd = this.backward(obs).steps;
		let eps = []
		let gamma = [];

		for (let i = 0; i < obs.length-1; i++)
		{
			eps.push({});
			for (let j of this.states)
			{
				eps[i][j] = {};
				for (let k of this.states)
					eps[i][j][k] = (fwd[i][j] * this.transitionProbs[j][k] * this.emissionProbs[obs[i+1]][this.states.indexOf(k)] * bwd[i+1][k])/this.sumProb(fwd, bwd, i, obs);
			}
		}
		for (let i = 0; i < obs.length-1; i++)
		{
			gamma.push({});
			for (let j of this.states)
			{
				gamma[i][j] = 0;
				for (let k of this.states)
					gamma[i][j] += eps[i][j][k];
			}
		}

		for (let i of this.states)
			this.initProbs[i] = gamma[0][i];

		for (let i of this.states)
		{
			let sum = 0;
			for (let j of this.states)
			{
				this.transitionProbs[i][j] = sumEps(eps, i, j)/sumGamma(gamma, i);
				sum += this.transitionProbs[i][j];
			}
			for (let j of this.states)
				this.transitionProbs[i][j] = 1 / sum * this.transitionProbs[i][j];
		}

		for (let i = 0; i < obs.length; i++)
		{
			let sum = 0;
			for (let j of this.states)
			{
				this.emissionProbs[obs[i]][this.states.indexOf(j)] = sumGammaT(gamma, j, this.emissionProbs, this.states, obs)/sumGamma(gamma, j);
				sum += this.emissionProbs[obs[i]][this.states.indexOf(j)];
			}
			for (let j of this.states)
				this.emissionProbs[obs[i]][this.states.indexOf(j)] = (1 / sum )* this.emissionProbs[obs[i]][this.states.indexOf(j)];
		}
	}

	prob(obs)
	{
		let fwd = fwd(obs)
	}

	sumProb(fwd, bwd, i, obs)
	{
		let sum = 0;
		for (let j of this.states)
			for (let k of this.states)
				sum += fwd[i][j] * this.transitionProbs[j][k] * this.emissionProbs[obs[i+1]][this.states.indexOf(k)] * bwd[i+1][k];
		return sum;
	}

	train(kmeans, sequence)
	{
		let sequenceId = [];
		for (let i = 0; i < sequence.length; i++)
			sequenceId.push(kmeans.test(sequence[i]).idx.toString());

		this.baumWelch(sequenceId);
	}

	recognize(kmeans, sequence)
	{
		let sequenceId = [];
		for (let i = 0; i < sequence.length; i++)
			sequenceId.push(kmeans.test(sequence[i]).idx.toString());
		return this.forward(sequenceId);
	}

	albinanumberone()
	{
		// return love ya;
	}
}

function sumEps(eps, j, k)
{
	let sum = 0;
	for (let i = 0; i < eps.length; i++)
		sum += eps[i][j][k];
	return sum;
}

function sumGamma(gamma, j)
{
	let sum = 0;
	for (let i = 0; i < gamma.length; i++)
		sum += gamma[i][j];
	return sum;
}

function sumGammaT(gamma, j, emission, states, obs)
{
	let sum = 0;
	for (let i = 0; i < gamma.length; i++)
		sum += gamma[i][j] * emission[obs[i]][states.indexOf(j)];
	return sum;
}

function randombetween(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function fillZeros(a)
{
	let res = [];
	for (let i = 0; i < a; i++)
	{
		var max = 100;
		var r1 = randombetween(0, max);
		var r2 = randombetween(0, max-r1);
		var r3 = max - r1;
		res.push([0.000000001,0.000000001,0.000000001]);
		//res.push([0,0,0]);
	}
	return res;
}

function fill()
{
	var max = 100;
	var r1 = randombetween(0, max);
	var r2 = randombetween(0, max-r1);
	var r3 = max - r1 - r2;
	return [r1/100, r2, r3/100];
}