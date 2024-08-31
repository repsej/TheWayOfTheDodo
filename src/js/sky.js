/** @format */

///////////////////////////////////////////////////////////////////////////////
// sky with background gradient, stars, and planets
class Sky extends EngineObject {
	constructor() {
		super();

		this.renderOrder = -1e4;
		this.seed = randInt(1e9);
		// this.skyColor = new Color().setHex("#b7fffe"); //  rgb(0, 0, 0.2); //  hsl(0, 0, 0.1);
		// this.horizonColor = new Color().setHex("#3c71e4"); //rgb(0, 0, 0); //this.skyColor.subtract(hsl(0, 0, 0.05, 0)); //.mutate(0.3);

		this.skyColor = rgb(0, 0, 0.3);
		this.horizonColor = rgb(0.2, 0.0, 0.0);
	}

	render() {
		// fill background with a gradient
		const gradient = mainContext.createLinearGradient(0, 0, 0, mainCanvas.height);
		// @ts-ignore
		gradient.addColorStop(0, this.skyColor);
		// @ts-ignore
		gradient.addColorStop(1, this.horizonColor);
		mainContext.save();
		mainContext.fillStyle = gradient;
		mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
		mainContext.globalCompositeOperation = "lighter";

		// draw stars
		const random = new RandomGenerator(this.seed);
		for (let i = 100 + Math.floor((mainCanvas.width * mainCanvas.height) / 1500); i--; ) {
			const size = random.float(0.5, 2) ** 2;
			const speed = random.float() < 0.95 ? random.float(-3, 3) : random.float(-99, 99);
			const color = hsl(random.float(-0.3, 0.2), random.float(), random.float());
			const extraSpace = 50;
			const w = mainCanvas.width + 2 * extraSpace,
				h = mainCanvas.height + 2 * extraSpace;

			let camMult = size * 3;

			const screenPos = vec2(
				mod(random.float(w) + time * speed - cameraPos.x * camMult, w) - extraSpace,
				mod(random.float(h) + time * speed * random.float() + cameraPos.y * camMult, h) - extraSpace
			);
			// @ts-ignore
			mainContext.fillStyle = color;
			mainContext.fillRect(screenPos.x, screenPos.y, size, size);
		}
		mainContext.restore();
	}
}
