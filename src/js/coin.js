/** @format */

class Coin extends EngineObject {
	static count = 0;

	constructor(pos) {
		super(pos, vec2(1), spriteAtlas.coin);
		this.yOrig = pos.y;
		this.index = Coin.count;
		this.setCollision(true, false, false);
		Coin.count++;
	}

	update(o) {
		//super.update(); // NO super update !

		this.pos.y = this.yOrig + Math.sin(this.index / 5 + time * 15) / 15;
	}

	collideWithObject(o) {
		if (o != player) return false;

		// check if player in range
		const d = this.pos.distanceSquared(player.pos);

		if (d > 1) return false;

		// award points and destroy
		++score;

		sound_score.play(this.pos);

		this.destroy();

		makeCollectEffect(this.pos, 0.1);
		makeDebris(this.pos, new Color(0.5, 1, 1), randInt(5, 10), 0.05, 0.1, 0.05);

		Coin.count--;

		if (Coin.count == 0) levelShowExit();

		return false;
	}
}
