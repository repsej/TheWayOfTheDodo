// /** @format */

// class Enemy extends GameObject {
// 	constructor(pos) {
// 		super(pos, vec2(0.9, 0.9), spriteAtlas.enemy);

// 		this.drawSize = vec2(1);
// 		this.color = hsl(rand(), 1, 0.7);
// 		this.health = 5;
// 		this.bounceTimer = new Timer(rand(1e3));
// 		this.setCollision(true, false);
// 	}

// 	update() {
// 		super.update();

// 		if (!player) return;

// 		// jump around randomly
// 		if (this.groundObject && rand() < 0.01 && this.pos.distance(player.pos) < 20) {
// 			this.velocity = vec2(rand(0.1, -0.1), rand(0.4, 0.2));
// 			sound_jump.play(this.pos, 0.4, 2);
// 		}

// 		if (isOverlapping(this.pos, this.size, player.pos, player.size)) {
// 			if (player.velocity.y < -0.1) {
// 				this.kill();
// 			} else {
// 				player.damage(1, this);
// 			}
// 		}
// 	}

// 	kill() {
// 		if (this.destroyed) return;

// 		++score;
// 		sound_score.play(this.pos);
// 		makeDebris(this.pos, this.color);
// 		this.destroy();
// 	}

// 	render() {
// 		// bounce by changing size
// 		const bounceTime = this.bounceTimer.time * 6;
// 		this.drawSize = vec2(1 - 0.1 * Math.sin(bounceTime), 1 + 0.1 * Math.sin(bounceTime));

// 		// make bottom flush
// 		let bodyPos = this.pos;
// 		bodyPos = bodyPos.add(vec2(0, (this.drawSize.y - this.size.y) / 2));
// 		drawTile(bodyPos, this.drawSize, this.tileInfo, this.color, this.angle, this.mirror, this.additiveColor);
// 	}
// }
