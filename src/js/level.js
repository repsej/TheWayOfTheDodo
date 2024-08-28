/** @format */

const tileType_empty = 0;
const tileType_ground = 1;
const tileType_spike = 2;

// NO, game much better without ...
// let levelTexts = [
// 	// 0
// 	isTouchDevice ? "Tap screen to jump" : "Space to jump",

// 	// 1
// 	"Hold down jump button for a long jump",
// 	"Make wall jumps by holding down jump button",
// 	"Release jump button to break the jump",
// 	"Sometimes doing nothing is best",
// 	"Finding a good path is key to completing a level fast",

// 	// 6
// 	"",
// 	"",
// 	"",
// 	"",

// 	"",
// 	"",
// 	"",
// ];

// let levelTexts = [
// 	"Enter the Dodo Dojo",

// 	"Welcome young apprentince",
// 	"Here you will learn The Way of the Dodo",
// 	"Never forget our lost paradise the island of Mauritius",
// 	"Where our forefathers fought our eternal enemies the evil dutchlings",
// 	"We evolved from pigeons to become flightless",
// 	"",

// 	"We are fligtless but not fightless",
// 	"Our cause is just",
// 	"Just one more cause",

// 	"",
// 	"",
// 	"",
// 	"",
// 	"",

// 	"",
// 	"",
// 	"",
// ];

// let levelTexts = [
// 	"Enter the Dojo of Dodo knowledge !",

// 	"The Dodo lived on the island of Mauritius",
// 	"The Dodo was 1 meter tall (3 feet) and weighted 23 kilos (50 pounds)",
// 	"The Dodo laid only one egg at a time",
// 	"The closest living relative is the Nicobar Pigeon",
// 	"Very few physical remains of the Dodo is left today",
// 	"The is a Dodo in 'Alice's Adventures in Wonderland'",
// 	"The Dodo evolved from lost pigeons over hundreds of thousands of years",
// 	"The Dodo adapted to their peaceful island sorounding to become flightless",
// 	"The Dodo was first seen by Dutch settlers in 1598",
// 	"Less than 65 years later, the Dodo was completely extinct",
// 	"The last confirmed sighting of the Dodo was in 1662",
// 	"Until humans, the Dodo had no predators",
// 	"The Dodo weren't really all that tasty",
// ];

let player, playerStartPos, tileData, tileLayers, sky;
let exitStartPos = undefined;
let exit = undefined;
let levelSize;
let levelStartTime = -1;

const levelSetTileData = (pos, layer, data) =>
	pos.arrayCheck(tileCollisionSize) && (tileData[layer][((pos.y | 0) * tileCollisionSize.x + pos.x) | 0] = data);

const levelGetTileData = (pos, layer) =>
	pos.arrayCheck(tileCollisionSize) ? tileData[layer][((pos.y | 0) * tileCollisionSize.x + pos.x) | 0] : 0;

function levelBuild(level) {
	Coin.count = 0;

	exitStartPos = undefined;
	exit = undefined;

	playerStartPos = undefined;
	tileData = undefined;
	tileLayers = undefined;
	sky = undefined;

	levelLoad(level);
	sky = new Sky();
	levelSpawnPlayer();
	levelStartTime = time;
}

function levelSpawnPlayer() {
	//if (gameState == GameState.GAME_OVER) return;

	if (player) player.destroy();

	player = new Player(playerStartPos);
}

function levelLoad(levelNumber) {
	engineObjectsDestroy();

	const tileMapData = levelData[levelNumber];
	levelSize = vec2(tileMapData.w, tileMapData.h);
	initTileCollision(levelSize);

	// create table for tiles in the level tilemap
	const tileLookup = {
		coin: 1,
		player: 3,
		ground: 6,
		exit: 7,
		spike: 8,
		steel: 9,
	};

	// set all level data tiles
	tileData = [];
	tileLayers = [];
	playerStartPos = vec2(1, levelSize.y);
	// const layerCount = tileMapData.layers.length;
	// for (let layer = layerCount; layer--; ) {
	const layerData = tileMapData.d;
	const tileLayer = new TileLayer(vec2(), levelSize, tile(0, 16));
	tileLayer.renderOrder = -1e3;
	tileLayers[0] = tileLayer;
	tileData[0] = [];

	for (let x = levelSize.x; x--; )
		for (let y = levelSize.y; y--; ) {
			const pos = vec2(x, levelSize.y - 1 - y);
			const tile = layerData[y * levelSize.x + x];
			const objectPos = pos.add(vec2(0.5));

			// Create objects
			switch (tile) {
				case tileLookup.coin:
					new Coin(objectPos);
					continue;

				case tileLookup.player:
					playerStartPos = objectPos;
					continue;

				case tileLookup.exit:
					exitStartPos = objectPos;
					continue;

				case tileLookup.spike:
					levelSetTileData(pos, 0, tile);
					setTileCollisionData(pos, tileType_spike);
					tileLayer.setData(pos, new TileLayerData(tile - 1));
					break;

				case tileLookup.steel:
				case tileLookup.ground:
					levelSetTileData(pos, 0, tile);
					setTileCollisionData(pos, tileType_ground);

					let direction = 0,
						mirror = 0;

					if (tile == tileLookup.ground) {
						direction = randInt(4);
						mirror = randInt(2);
					}

					tileLayer.setData(pos, new TileLayerData(tile - 1, direction, !!mirror));
			}
		}
	tileLayer.redraw();
}

function levelShowExit() {
	if (exit) return;
	exit = new Exit(exitStartPos);
}
