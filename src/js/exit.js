/** @format */

class Exit extends EngineObject {
	constructor(pos) {
		super(pos, vec2(2, 2), spriteAtlas.exit);

		this.setCollision(true, false, true);

		sound_exitAppear.play(this.pos);

		makeDebris(this.pos, new Color(1, 1, 1), 25, 0.05, 0.01, 0.05);
		makeDebris(this.pos, new Color(1, 1, 1), 25, 0.1, 0.1, 0.05);
	}

	collideWithObject(o) {
		if (o instanceof Player) {
			if (o.pos.distanceSquared(this.pos) < 2) {

				gameNextLevel();
			}
		}
		return false;
	}

	collideWithTile() {
		if (abs(this.velocity.y) > 0.1) sound_explosion.play(this.pos, 0.1 + abs(this.velocity.y / 2));

		return true;
	}
}
