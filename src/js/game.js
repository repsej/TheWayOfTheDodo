/** @format */

let spriteAtlas, score, level, transitionFrames, timeBonus;

let GameState = {
	PLAY: 0,
	GAME_OVER: 1,
	WON: 2,
};

let gameState = GameState.PLAY;
const TRANSITION_FRAMES = 180;
const TIME_BONUS_SCORE = 100;
const LIVE_BONUS_SCORE = 5000;
const TIME_MAX = 45;
const LIVES_START = 3;

let gameBottomText = undefined;
let lives = undefined;
let titleSize;
var gameIsNewHiscore = false;

let title;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
	// create a table of all sprites
	spriteAtlas = {
		coin: tile(0),
		blob: tile(1),
		playerWalk: tile(2),
		playerJump: tile(4),
		exit: tile(6),
		concreteBlock: tile(9),
		title: tile(vec2(48, 32), vec2(48, 32)),
	};

	// enable touch gamepad on touch devices
	touchGamepadEnable = true;

	transitionFrames = score = level = 0;
	gravity = -0.01;
	gameState = GameState.PLAY;

	lives = LIVES_START;
	titleSize = 7;

	levelBuild(level);
	musicInit(level);

	title = new EngineObject(vec2(levelSize.x / 2, levelSize.y * 0.74), vec2(16, 8), spriteAtlas.title);
	title.setCollision(false, false, false);
	title.gravityScale = 0;
}

function gameSetState(newState) {
	gameBottomText = undefined;
	gameState = newState;

	switch (newState) {
		case GameState.GAME_OVER:
			levelStartTime = time;
			levelBuild(14);
			musicInit(22);
			new ConcreteBlock(vec2(levelSize.x / 2, levelSize.y * 2));
			gameIsNewHiscore = savefileUpdateHiscore(score);
			break;

		case GameState.WON:
			level = 13;
			gameNextLevel();
			level = 31;
			musicInit(level);
			musicOn = true;
			levelStartTime = time;

			//gameBottomText = "Lives bonus " + lives * LIVE_BONUS_SCORE;
			score += lives * LIVE_BONUS_SCORE;

			gameIsNewHiscore = savefileUpdateHiscore(score);
			break;

		default:
			break;
	}
}

function gameNextLevel(now = false) {
	if (now) {
		transitionFrames = 1;
		return;
	}

	if (transitionFrames > 0) return;

	musicPlayCrash();

	sound_exit.play(player.pos);
	player.jumpToNextLevel();

	musicOn = false;

	gameBottomText = undefined;
	if (Math.ceil(timeBonus) > 0) gameBottomText = "Time bonus " + Math.ceil(timeBonus) * TIME_BONUS_SCORE;

	transitionFrames = TRANSITION_FRAMES;
}

function gameUpdate() {
	musicUpdate();

	switch (gameState) {
		case GameState.WON:
			VictoryRocket.spawnRandom();
			cameraPos = cameraPos.lerp(player.pos, 0.05);
			if (time - levelStartTime > 5) {
				if (!gameBottomText) sound_exitAppear.play();
				gameBottomText = "[Click to start new game]";
				if (inputJumpReleased()) gameInit();
			}
			break;

		case GameState.GAME_OVER:
			if (time - levelStartTime > 5) {
				if (!gameBottomText) sound_exitAppear.play();
				gameBottomText = "[Click to start new game]";
				if (inputJumpReleased()) gameInit();
			}
			cameraScale = min(mainCanvas.width / levelSize.x, mainCanvas.height / levelSize.y);
			cameraPos = levelSize.scale(0.5);
			break;

		case GameState.PLAY:
			if (transitionFrames > 0) {
				let transProgress = (TRANSITION_FRAMES - transitionFrames) / TRANSITION_FRAMES;

				// Time bonus
				timeBonus = Math.ceil(timeBonus);

				if (level > 0 && transProgress > 0.2) {
					if (timeBonus > 0 && transitionFrames % 2 == 0) {
						score += TIME_BONUS_SCORE;
						timeBonus--;
						sound_score.play();
					}
				}

				// Camera

				cameraPos.y += levelSize.y * 0.035 * transProgress;
				cameraScale *= 0.992;
				titleSize *= 0.992;
				cameraPos = cameraPos.lerp(player.pos, transProgress / 10);

				player.drawSize = player.drawSize.scale(1.02);

				transitionFrames--;

				if (transitionFrames <= 0) {
					if (level == 0) score = 0;

					gameSkipToLevel(++level);
				}
			} else {
				timeBonus = TIME_MAX - (time - levelStartTime);
				if (timeBonus <= -1 && level != 0) {
					player.kill(true);
				}

				timeBonus = max(timeBonus, 0);

				if (level == 0) {
					//gameBottomText = levelTexts[level];
					//gameBottomText = "Dodo Dojo: 13 chambers of fowl play";
					gameBottomText = isTouchDevice ? "Tap to jump" : "Space to jump";

					timeBonus = 0;
				} else {
					gameBottomText = "Chamber " + level + " of 13";
					// if (levelTexts[level]) gameBottomText += ". " + levelTexts[level];
				}
				cameraScale = min(mainCanvas.width / levelSize.x, mainCanvas.height / levelSize.y);
				cameraPos = levelSize.scale(0.5);
			}
			break;
	}

	if (!IS_RELEASE) {
		if (keyWasPressed("KeyG")) {
			lives = 1;
			player?.kill();
		}

		if (keyWasPressed("KeyW")) {
			level = 13;
			gameNextLevel();
		}

		if (keyWasPressed("KeyK")) player.kill();
		if (keyWasPressed("KeyN")) gameNextLevel();
		if (keyWasPressed("KeyT")) levelStartTime = time - TIME_MAX + 11;
	}

	if (!IS_RELEASE || gameState == GameState.WON) {
		if (keyWasPressed("PageUp")) gameSkipToLevel(++level);
		if (keyWasPressed("PageDown")) gameSkipToLevel(--level);
	}
}

function gameUpdatePost() {}

function gameSkipToLevel(newLevel) {
	gameBottomText = "";

	if (gameState == GameState.WON) {
		musicInit(level);
		return;
	}

	if (newLevel == 14) {
		gameSetState(GameState.WON);
		return;
	}

	level = mod(newLevel, levelData.length);
	levelBuild(level);
	musicInit(level);
	musicOn = true;
	//playMusic();
}

function gameDrawHudText(
	text,
	x,
	y,
	sizeFactor = 1,
	fontName = "monospace",
	fillColor = "#fff",
	outlineColor = "#000"
) {
	let fontSize = overlayCanvas.width / 40;

	fontSize = clamp(fontSize, 10, 25);
	fontSize *= sizeFactor;

	let outlineWidth = fontSize / 10;

	overlayContext.textAlign = "center";
	overlayContext.textBaseline = "middle";
	overlayContext.font = fontSize + "px " + fontName;

	let dShadow = fontSize / 10;

	// drop shadow
	overlayContext.fillStyle = outlineColor;
	overlayContext.lineWidth = outlineWidth;
	overlayContext.strokeStyle = outlineColor;
	overlayContext.strokeText(text, x + dShadow, y + dShadow);
	overlayContext.fillText(text, x + dShadow, y + dShadow);

	// text
	overlayContext.fillStyle = fillColor;
	overlayContext.lineWidth = outlineWidth;
	overlayContext.strokeStyle = outlineColor;
	overlayContext.strokeText(text, x, y);
	overlayContext.fillText(text, x, y);
}

function gameRender() {}

function gameRenderPost() {
	let scoreText;
	let halfTile = (overlayCanvas.height * 0.5) / levelSize.y;

	switch (gameState) {
		case GameState.PLAY:
			//gameDrawHudText(levelTexts[level], overlayCanvas.width * 0.5, overlayCanvas.height - halfTile);

			if (level == 0) {
				// let titleTopPos = worldToScreen(vec2(levelSize.x / 2, levelSize.y * 0.85));
				// let titleBottomPos = worldToScreen(vec2(levelSize.x / 2, levelSize.y * 0.65));

				let subtitleTopPos = worldToScreen(vec2(levelSize.x / 2, levelSize.y * 0.5));
				let subtitleBottomPos = worldToScreen(vec2(levelSize.x / 2, levelSize.y * 0.45));

				if (savefileGetHiscore()) {
					gameDrawHudText("Hiscore " + savefileGetHiscore(), overlayCanvas.width * 0.5, halfTile);
				}

				//const font = "Luminari";
				//const font = "Tahoma";
				const titleFont = "monospace";
				//let titleColor = hsl(rand(), 1, 0.5).toString();
				let titleColor = "#e7cb1b";

				// The Way of the Dodo

				// drawTile(
				// 	vec2(0, 0),
				// 	vec2(3, 2),
				// 	spriteAtlas.title,
				// 	undefined,
				// 	undefined,
				// 	undefined,
				// 	undefined,
				// 	undefined,
				// 	undefined,
				// 	overlayContext
				// );

				// gameDrawHudText("The Way of", titleTopPos.x, titleTopPos.y, titleSize, titleFont, titleColor);
				// gameDrawHudText("the Dodo", titleBottomPos.x, titleBottomPos.y, titleSize, titleFont, titleColor);

				gameDrawHudText(
					"Enter the Dodo Dojo",
					subtitleTopPos.x,
					subtitleTopPos.y,
					titleSize / 6,
					undefined,
					titleColor
				);

				gameDrawHudText(
					"13 chambers of fowl play",
					subtitleBottomPos.x,
					subtitleBottomPos.y,
					titleSize / 6,
					undefined,
					titleColor
				);
			} else {
				gameDrawHudText("Lives " + lives, (overlayCanvas.width * 1) / 4, halfTile);
				gameDrawHudText("Score " + score, (overlayCanvas.width * 2) / 4, halfTile);

				let timeColor = "#fff";

				if (timeBonus <= 10 && transitionFrames <= 0) {
					if ((time * 4) % 2 < 1) timeColor = "#f00";
				}

				gameDrawHudText(
					"Time " + Math.ceil(timeBonus),
					(overlayCanvas.width * 3) / 4,
					halfTile,
					undefined,
					undefined,
					timeColor
				);
			}

			break;

		case GameState.GAME_OVER:
			gameDrawHudText("GAME OVER", overlayCanvas.width / 2, overlayCanvas.height * 0.3, 5);

			scoreText = "Score " + score;
			if (savefileGetHiscore()) {
				scoreText += "          Hiscore " + savefileGetHiscore();
			}
			gameDrawHudText(scoreText, overlayCanvas.width / 2, halfTile);
			if (gameIsNewHiscore && (time * 4) % 2 > 1) gameDrawHudText("NEW HISCORE", overlayCanvas.width / 2, halfTile * 3);

			gameDrawHudText("See, 13 is dangerous !", overlayCanvas.width / 2, overlayCanvas.height - 3 * halfTile, 1);

			break;

		case GameState.WON:
			scoreText = "Score " + score;
			if (savefileGetHiscore()) {
				scoreText += "          Hiscore " + savefileGetHiscore();
			}

			gameDrawHudText(scoreText, overlayCanvas.width / 2, halfTile);

			gameDrawHudText("Life bonus " + lives + " x " + LIVE_BONUS_SCORE, overlayCanvas.width / 2, halfTile * 3, 0.7);

			if (gameIsNewHiscore) {
				// blink
				if ((time * 2) % 2 > 1) {
					gameDrawHudText("NEW HISCORE", overlayCanvas.width / 2, overlayCanvas.height * 0.8, 3);
				}
			} else {
				gameDrawHudText("YOU ARE A FREE BIRD !", overlayCanvas.width / 2, overlayCanvas.height * 0.8, 3);
			}

			if (!isTouchDevice) {
				gameDrawHudText(
					"[Page up/down to change music.  Chamber " + level + "]",
					(overlayCanvas.width * 2) / 4,
					overlayCanvas.height - halfTile * 3
				);
			}

			break;
	}

	if (gameBottomText) gameDrawHudText(gameBottomText, overlayCanvas.width * 0.5, overlayCanvas.height - halfTile);

	mainContext.drawImage(overlayCanvas, 0, 0);

	if (player) player.renderTop(); // On top of everything !
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ["tiles.png"]);
