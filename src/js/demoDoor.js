/** @format */

class DemoDoor extends Exit {
	constructor(pos) {
		super(pos);
		this.tileInfo = spriteAtlas.demoDoor;
	}

	onActivated() {
		gameNextLevel(true);
		inputPlaybackDemo = true;
	}
}
