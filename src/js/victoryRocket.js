/** @format */

const ROCKET_MAX_SIZE = 3;

class VictoryRocket extends EngineObject {
	static gravity = 10;
	static liveRockets = new Set();

	static destroyAllLive() {
		for (const i of VictoryRocket.liveRockets) {
			i.destroy();
		}

		VictoryRocket.liveRockets = new Set();
	}

	static spawnRandom() {
		const MAX_ROCKETS = 5;

		if (VictoryRocket.liveRockets.size >= MAX_ROCKETS) return;

		let rocketsPercentage = VictoryRocket.liveRockets.size / MAX_ROCKETS;

		if (rand() * rocketsPercentage * 20 < Math.sin(time) * Math.cos(time / 2.123)) {
			new VictoryRocket();
		}
	}

	constructor() {
		super(vec2(rand(mainCanvas.width * 1.2), mainCanvas.height), vec2(4, 20), undefined, 0, Colors.grey, 100000);

		this.setCollision(false, false, false);

		let speed = mainCanvas.height / 75;

		VictoryRocket.gravity = mainCanvas.height / 10000;

		let speedRand = rand(0.8, 1.2);

		this.velocity = vec2(rand(-1, 1), -speed * speedRand);
		this.explodeTime = time + rand(1, 2);

		VictoryRocket.liveRockets.add(this);

		this.renderOrder = -1000;

		this.rocketSize = rand(1, ROCKET_MAX_SIZE);

		sound_rocketFly.play(this.pos, this.rocketSize / 10, 2 * speedRand);
	}

	update() {
		// gravity
		this.velocity.y += VictoryRocket.gravity;

		this.pos = this.pos.add(this.velocity);

		this.angle = -this.velocity.angle();

		if (time > this.explodeTime) {
			VictoryRocket.liveRockets.delete(this);

			this.destroy();

			let explosionColor = hsl(rand(1), 1, 0.5);

			gameBlinkFrames += this.rocketSize * 4;

			setTimeout(() => {
				gameCameraShake(this.rocketSize - 1);
				sound_explosion.play(this.pos, this.rocketSize / ROCKET_MAX_SIZE);
			}, 1000 / this.rocketSize);

			let emitRate = this.rocketSize * 100 * rand(0.5, 1.5);
			let particleTime = this.rocketSize * 2 * rand(0.5, 1.5);
			let sizeStart = this.rocketSize * 0.2 * rand(0.5, 1.5);
			let sizeEnd = 0.0;
			let particleSpeed = rand(0.08, 0.15) * this.rocketSize;
			let particleAngleSpeed = rand(0.1, 0.5);
			let fadeRate = rand(0.1, 0.2);
			let randomness = rand(0.2, 0.5);
			let damping = (9 + this.rocketSize / ROCKET_MAX_SIZE) / 10;
			let dampingTrails = damping; // * 0.99;

			let gravityScale = rand(0.005, 0.2);

			let particles = new ParticleEmitter(
				screenToWorld(this.pos), // pos
				0, // angle
				0, // emitSize
				0.2, // emitTime
				emitRate, // emitRate
				PI * 2, // emiteConeAngle
				undefined, // tileIndex
				Colors.white, // colorStartA
				explosionColor, // colorStartB
				explosionColor, // colorEndA
				explosionColor, // colorEndB
				particleTime, // particleTime
				sizeStart, // sizeStart
				sizeEnd, // sizeEnd
				particleSpeed, // particleSpeed
				particleAngleSpeed, // particleAngleSpeed
				damping, // damping
				1, // angleDamping
				gravityScale, // gravityScale
				PI, // particleCone
				fadeRate, //fadeRate,
				randomness, // randomness
				false, // collide
				false, // additive
				true, // randomColorLinear
				this.renderOrder // renderOrder
			);

			let trails = new ParticleEmitter(
				screenToWorld(this.pos), // pos
				0, // angle
				0, // emitSize
				0.2, // emitTime
				emitRate, // emitRate
				PI * 2, // emiteConeAngle
				undefined, // tileIndex
				explosionColor, // colorStartA
				Colors.white, // colorStartB
				Colors.black, // colorEndA
				Colors.black, // colorEndB
				particleTime / 2, // particleTime
				sizeStart / 5, // sizeStart
				sizeEnd / 5, // sizeEnd
				particleSpeed, // particleSpeed
				particleAngleSpeed, // particleAngleSpeed
				dampingTrails, // damping
				1, // angleDamping
				gravityScale, // gravityScale
				PI, // particleCone
				fadeRate, //fadeRate,
				randomness, // randomness
				false, // collide
				false, // additive
				true, // randomColorLinear
				this.renderOrder // renderOrder
			);

			trails.trailScale = rand(5, 15);

			let explosion = new ParticleEmitter(
				screenToWorld(this.pos), // pos
				0, // angle
				1, // emitSize
				0.1, // emitTime
				200, // emitRate
				PI * 2, // emiteConeAngle
				undefined, // tileIndex
				Colors.white, // colorStartA
				Colors.white, // colorStartB
				Colors.white, // colorEndA
				Colors.white, // colorEndB
				0.25, // particleTime
				this.rocketSize, // sizeStart
				0, // sizeEnd
				0.001, // particleSpeed
				0.1, // particleAngleSpeed
				0.99, // damping
				1, // angleDamping
				0, // gravityScale
				PI, // particleCone
				0.9, //fadeRate,
				0.1, // randomness
				false, // collide
				false, // additive
				true, // randomColorLinear
				this.renderOrder // renderOrder
			);
		}
	}

	render() {
		drawRect(screenToWorld(this.pos), this.size.scale(0.04), this.color, this.angle, true);
	}
}
