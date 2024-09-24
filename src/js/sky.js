/** @format */

///////////////////////////////////////////////////////////////////////////////
// sky with background gradient, stars, and planets
class Sky extends EngineObject {
	constructor() {
		super();

		this.renderOrder = -1e4;
		this.seed = randInt(1e9);

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

		// let horizon = 0.8;
		// let islandThickness = 0.05;
		// let islandTop = horizon - islandThickness;

		// gradient.addColorStop(0, "#0148d6"); // sky top
		// gradient.addColorStop(islandTop, "#2b6dce"); // sky bottom
		// gradient.addColorStop(islandTop + 0.01, "#3b6363"); // island top

		// gradient.addColorStop(horizon, "#011a57"); // island bottom

		// gradient.addColorStop(horizon + 0.001, "#002a88"); // sea top
		// gradient.addColorStop(0.95, "#00e5d8"); // sea bottom
		// gradient.addColorStop(1, "#f1eedd"); // w sand

		mainContext.save();
		mainContext.fillStyle = gradient;
		mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
		mainContext.globalCompositeOperation = "lighter";

		// draw stars
		const random = new RandomGenerator(this.seed);
		for (let i = 100 + Math.floor((mainCanvas.width * mainCanvas.height) / 1500); i--; ) {
			const size = random.float(0.5, 2) ** 2;

			const speed = random.float() < 0.95 ? 0 : random.float(-99, 99);
			const color = hsl(random.float(-0.3, 0.2), random.float(), random.float());
			const w = mainCanvas.width,
				h = mainCanvas.height;

			let camMult = size * 3;

			const screenPos = vec2(
				mod(random.float(w) + time * speed - cameraPos.x * camMult, w),
				mod(random.float(h) + time * abs(speed) * random.float() + cameraPos.y * camMult, h)
			);
			// @ts-ignore
			mainContext.fillStyle = color;
			mainContext.fillRect(screenPos.x, screenPos.y, size, size);

			// reflection
			// mainContext.fillRect(
			// 	screenPos.x,
			// 	mainCanvas.height * (2 * islandTop + islandThickness) - screenPos.y,
			// 	size,
			// 	size
			// );
		}
		mainContext.restore();
	}
}
