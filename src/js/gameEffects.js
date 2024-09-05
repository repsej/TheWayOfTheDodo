/** @format */

///////////////////////////////////////////////////////////////////////////////
// sound effects

//const sound_die = new Sound([1.4, , 100, 0.07, 0.02, 0.04, 2, 0.5, , , -500, 0.2, , , 0.1, , 0.1, 0.86, 0.38, , 15]);
const sound_jump = new Sound([0.4, 0.2, 250, 0.04, , 0.04, , , 1, , , , , 3]);
const sound_dodge = new Sound([0.4, 0.2, 150, 0.05, , 0.05, , , -1, , , , , 4, , , , , 0.02]);
const sound_walk = new Sound([0.3, 0.1, 50, 0.005, , 0.01, 4, , , , , , , , 10, , , 0.5]);
const sound_score = new Sound([1.04, 0, 2e3, , 0.02, 0.01, , 2.2, , , 50, , , , , , , 0.5, 0.01]); // Loaded Sound 1197

// prettier-ignore
const sound_splat = new Sound([2,.1,523.2511,.13,,.12,4,1.23,-46.2,,-100,.01,.01,,114,,.21,.85,.05]); // Loaded Sound 1385

// prettier-ignore
const sound_squark = new Sound([1, 0.2, 600, 0.05, 0.13, 0.13, 2, 0.5, 50, , 10, 0.11, 0.02, , 20, 0.12, , , , 0.5, 5e3 ]);

// prettier-ignore
const sound_explosion = new Sound([4,.5,802,.1,.05,.5,4,4.59,,,,,,1.2,,2,.21,.31,.1,.1]);

// prettier-ignore
const sound_exit = new Sound([.7,,118,.03,.28,.41,1,.2,-6,-162,-109,.05,.1,,,,,.51,.27,.06,496]); // Powerup 1173

const sound_exitAppear = new Sound([, , 336, 0.03, 0.21, 0.3, , 2.1, , -22, , , 0.1, 0.4, , , , 0.77, 0.12]); // Powerup 1180

const sound_rocketFly = new Sound([0.2, 0.1, 1e3, , 0.2, 2, , 0, -0.1, , , , , 0.3, , , , , 0.15]);

// No getting fainter w range
sound_explosion.range = 0;
sound_rocketFly.range = 0;

///////////////////////////////////////////////////////////////////////////////
// special effects

// const persistentParticleDestroyCallback = (particle) => {
// 	// copy particle to tile layer on death
// 	//ASSERT(!particle.tileInfo, "quick draw to tile layer uses canvas 2d so must be untextured");
// 	if (particle.groundObject)
// 		tileLayers[0].drawTile(
// 			particle.pos,
// 			particle.size,
// 			particle.tileInfo,
// 			particle.color,
// 			particle.angle,
// 			particle.mirror
// 		);
// };

function makeBlood(pos, amount) {
	let emitter = makeDebris(pos, hsl(0, 1, 0.5), amount, 0.2, 0);
	emitter.gravityScale = 1.2;
}

function makeDebris(pos, color = hsl(), amount = 50, size = 0.2, elasticity = 0.3, speed = 0.1) {
	const color2 = color.lerp(hsl(), 0.5);
	const fadeColor = color.copy();
	fadeColor.a = 0;

	const emitter = new ParticleEmitter(
		pos,
		0,
		1,
		0.1,
		amount / 0.1,
		PI,
		undefined,
		color,
		color2,
		fadeColor,
		fadeColor,
		3,
		size,
		size,
		speed / 10,
		0.05,
		1,
		0.95,
		0.5,
		PI,
		0, // random
		0.1,
		true
	);
	emitter.elasticity = elasticity;
	//emitter.particleDestroyCallback = persistentParticleDestroyCallback;
	return emitter;
}

function makeCollectEffect(pos, force = 1) {
	new ParticleEmitter(
		pos,
		0, // angle
		0.5, // eimtSize
		0.1, // emitTime
		100 * force, // emitRate
		PI / 2, // emitConeAngle
		undefined, // tileinfo
		rgb(1, 1, 1),
		rgb(1, 1, 1),
		rgb(0, 1, 1, 0),
		rgb(1, 1, 1, 0),
		0.5, // particleTime
		0.1, // sizeStart
		0.4, // sizeEnd
		0.01, // speed
		0.05, // damp
		0.9, // angledamp
		1, // angleDamp
		-0.2, // gravityScale
		PI, // particleConeAngle
		0.05, // fadeRate
		0.0, // randomness
		false, // col tile
		true, // additive
		true, // linearColor
		5 // renderOrder
	);
}

function makeSmoke(pos, force = 1) {
	// smoke
	new ParticleEmitter(
		pos, // pos
		0, // angle
		0.2 * force, // radius / 2, // emitSize
		0.3, // emitTime
		rand(50, 150) * force, // emitRate
		PI, // emiteCone
		spriteAtlas.blob,
		rgb(1, 1, 1),
		rgb(0.5, 0.5, 0.5),
		rgb(1, 1, 1),
		rgb(1, 1, 1),
		0.3, // time
		0.3, // sizeStart
		0.05, // sizeEnd
		0.01 / 10, // speed
		0.1, // angleSpeed
		0.9, // damp
		0.9, // angleDamp
		-0.1, // gravity
		PI, // particle cone
		0.5, // fade
		0.5, // randomness
		false, // collide
		false, // additive
		true, // colorLinear
		0 // renderOrder
	);
}
