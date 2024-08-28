/** @format */

var patterns = [[]];

var musicSongLength = 0;

var instrumentParamaters = [
	[1, 0, 43, 0.01, 0.5, 0.5, , 0.5], // 0 bass
	[20, 0, 170, 0.003, , 0.008, , 0.97, -35, 53, , , , , , 0.1], // 1 base drum
	[0.8, 0, 270, , , 0.12, 3, 1.65, -2, , , , , 4.5, , 0.02], // 2 snare
	[1, 0, 77, , 0.3, 0.7, 2, 0.41, , , , , , , , 0.06], // 3 melody lead
	[2, , 400, , , 0.5, 2, 0.1, , 1, , , , 2.5, , 0.5, , 0.5, 0.1], // 4 crash
];

var instrumentList = [];

var songData = [
	instrumentList,
	patterns, // patterns
	[1], // sequence (NOT USED)
	80, // BPM
];

function unfoldPattern(instrument, pan, startnode, pattern, starts) {
	var nodes = [];
	nodes.push(instrument);
	nodes.push(pan);

	for (const s of starts) {
		for (const b of pattern) {
			nodes.push(startnode + b + s);
		}
	}

	return nodes;
}

function mutateInstrumentParams(instrument, rng) {
	//console.log(instrument);

	// skipping the first X paramters (vol, rand, and freq)
	for (let i = 4; i < instrument.length; i++) {
		if (typeof instrument[i] == "number") {
			instrument[i] = rng.float(instrument[i] * 0.5, instrument[i] * 1.5);
		}
	}

	//console.log(instrument);
}

function musicIsNode(n) {
	return typeof n == "number" && !isNaN(n);
}

let melodyNodes = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]; // major pent

function createMutatedMelody(melody, swaps = 5, mutations = 5, rng, dHafltones) {
	melody = melody.slice(); // copy

	// console.log("Melody before", melody);

	for (let i = 0; i < swaps; i++) {
		let x = rng.int(melody.length - 1);
		let y = x + 1;

		let t = melody[x];
		melody[x] = melody[y];
		melody[y] = t;
	}

	let mutatedIndexes = [];

	for (let i = 0; i < mutations; i++) {
		let x, isNode, oldNode;

		do {
			x = rng.int(melody.length);
			oldNode = melody[x] - dHafltones;
			isNode = musicIsNode(oldNode);
		} while (!isNode || mutatedIndexes.indexOf(x) != -1);

		mutatedIndexes.push(x);

		let nodeIndex = melodyNodes.indexOf(oldNode);

		if (nodeIndex == 0) {
			nodeIndex++;
		} else if (nodeIndex == melodyNodes.length - 1) {
			nodeIndex--;
		} else {
			nodeIndex += rng.float() < 0.5 ? 1 : -1;
		}

		//nodeIndex = clamp(nodeIndex, 0, melodyNodes.length);

		melody[x] = melodyNodes[nodeIndex] + dHafltones;

		assert(musicIsNode(melody[x]));
	}

	// console.log("Melody after", melody);

	return melody;
}

function createMusic(level) {
	const rng = new RandomGenerator(376176 + (level + 1) * 9999);

	musicTempo = rng.float(4, 5);
	console.log("musicTempo", musicTempo);

	// Instruments

	instrumentList = [];
	for (const i of instrumentParamaters) {
		instrumentList.push(i.slice()); // copy array !
	}
	for (let i = 0; i < instrumentList.length; i++) {
		const instrument = instrumentList[i];
		mutateInstrumentParams(instrument, rng);
	}
	songData[0] = instrumentList;

	createInstruments();

	// prettier-ignore
	// let chordStarts = [
	// 	0, 0,
	// 	0, 0,
	// 	5, 5,
	// 	0, 0,
	// 	7, 5,
	// 	0, 0,
	// ];

	patterns = [[], []];

	//let chords = [0, 2, 4, 7, 9];

	let chords = [0, 5, 7]; // safe minor
	// let chords = [0, 3, 5, 7, 10]; // minor
	let chordStarts = [0, 0];
	for (let i = 0; i < 3; i++) {
		let c1 = chords[rng.int(chords.length)];
		chordStarts.push(c1, c1);

		// let c1 = chords[rng.int(chords.length)];
		// let c2 = chords[rng.int(chords.length)];

		// if (rng.int(2) < 1) {
		// 	chordStarts.push(c1, c1);
		// } else {
		// 	chordStarts.push(c1, c2);
		// }
	}

	// console.log(chordStarts);

	// Melody

	let melodyShift = [-2, -1, -1, 0, 0, 0, 0, 1, 1, 2];

	let lastNodeIndex = 5; // middle node

	let melodyRythm = [1, 0, rng.int(0, 2), rng.int(0, 2), 1, 0, rng.int(0, 2), rng.int(0, 2)];
	melodyRythm = createMutatedMelody(melodyRythm, 10, 0, rng);

	let melodyOffset = 24;

	let melody = [];
	for (let i = 0; i < chordStarts.length * 2 - 1; i++) {
		if (melodyRythm[i % melodyRythm.length]) {
			lastNodeIndex += melodyShift[rng.int(melodyShift.length)];
			lastNodeIndex = clamp(lastNodeIndex, 0, melodyNodes.length - 1);
			melody.push(melodyOffset + melodyNodes[lastNodeIndex]);
		} else {
			melody.push(undefined);
		}
	}
	melody.push(undefined); // last node always a pause

	let mutatedMelody = createMutatedMelody(melody, 5, 3, rng, melodyOffset);
	let mutatedMelody2 = createMutatedMelody(mutatedMelody, 5, 3, rng, melodyOffset);

	let reversedMutation = mutatedMelody.slice(); // copy
	reversedMutation.reverse();

	let fullMeleody = [3, 0];
	fullMeleody = fullMeleody.concat(melody);
	fullMeleody = fullMeleody.concat(mutatedMelody);
	fullMeleody = fullMeleody.concat(reversedMutation);
	fullMeleody = fullMeleody.concat(mutatedMelody2);
	patterns[0].push(fullMeleody);

	// Bass
	let randHit = () => (rng.float() < 0.5 ? undefined : 0);

	//let bassPattern = [0, 4, 7, 4, 0, 4, 7, 4];
	let bassPattern = [0, randHit(), randHit(), randHit(), 0, randHit(), randHit(), 12];

	let bassNodes = unfoldPattern(0, -0.1, 24, bassPattern, chordStarts);
	patterns[0].push(bassNodes);

	let bassNodes2 = unfoldPattern(0, 0.1, 24 + 7, bassPattern, chordStarts);
	patterns[0].push(bassNodes2);

	musicSongLength = bassNodes.length - 2;

	// Drums

	let bdStarts = Array(chordStarts.length).fill(0);
	let snareStarts = Array(chordStarts.length / 2).fill(0);

	let bdPattern = [0, undefined, randHit(), undefined, 0, undefined, randHit(), undefined];
	let snarePattern = [
		undefined,
		randHit(),
		0,
		randHit(),

		undefined,
		randHit(),
		0,
		randHit(),

		undefined,
		randHit(),
		0,
		randHit(),

		undefined,
		undefined,
		0,
		0,
	];

	patterns[0].push(unfoldPattern(1, 0, 7, bdPattern, bdStarts));
	patterns[0].push(unfoldPattern(2, 0.1, 7, snarePattern, snareStarts));
}

var vol = 0.2;
var musicOn = true;

var musicStartTime = 0;

function musicInit(level) {
	createMusic(level);
	musicStartTime = time;
	musicLastPlayedBeat = -1;
}

let musicLastPlayedBeat = -1;
let musicTempo = 5;

function musicUpdate() {
	let timeSinceStart = time - musicStartTime;

	if (timeSinceStart < 0) return;

	let beat = Math.floor(timeSinceStart * musicTempo) % musicSongLength;

	if (beat == musicLastPlayedBeat) return;

	player?.onNewBeat(beat);

	musicLastPlayedBeat = beat;

	if (!musicOn) return;

	//console.log("beat", beat);

	// crashes
	if (beat % (musicSongLength / 4) == 0) musicPlayCrash(beat == 0 ? 2.5 : 1);

	for (const pat of patterns[0]) {
		let instrument = instrumentList[pat[0]];
		let pan = pat[1];
		let semitone = pat[(beat % (pat.length - 2)) + 2];

		if (typeof semitone == "number" && !isNaN(semitone)) {
			// console.log("semi", semitone);

			//instrument.playNote(semitone - 12, vec2(cameraPos.x + pan, cameraPos.y), vol);
			instrument.playNotePure(semitone - 12, pan, vol);
		}
	}
}

function createInstruments() {
	for (let k in instrumentList) {
		instrumentList[k] = new Sound(instrumentList[k]);
	}
}

function musicPlayCrash(strength = 2) {
	instrumentList[4].playNotePure(12, 0, vol * strength);
}
