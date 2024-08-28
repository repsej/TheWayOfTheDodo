/** @format */

class ConcreteBlock extends EngineObject {
	constructor(pos) {
		super(pos, vec2(8, 8), spriteAtlas.concreteBlock);
		this.setCollision(true, false, true);
		this.elasticity = 0.2;
	}

	collideWithObject(o) {
		if (o instanceof Player) {
			o.destroy();
			player = null;

			makeBlood(o.pos, 1000);
			sound_splat.play(this.pos);

			setTimeout(() => {
				sound_squark.play(o.pos, 2, 0.8);
				sound_squark.play(o.pos, 2, 0.6);
			}, 200);

			sound_explosion.play(o.pos, 5);
		}
		return false;
	}
}
