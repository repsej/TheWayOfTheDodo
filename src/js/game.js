/** @format */

let spriteAtlas, score, level, transitionFrames, timeLeft;

let bonusText, bonusAmmount, bonusGivenTime;

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
let gameBlinkFrames = 0;
let cameraShake = vec2();

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
	gameIsNewHiscore = false;

	transitionFrames = score = level = 0;
	gravity = -0.01;
	gameState = GameState.PLAY;

	lives = LIVES_START;
	titleSize = 7;

	levelBuild(level);
	musicInit(level);

	VictoryRocket.destroyAllLive();

	title = new EngineObject(vec2(levelSize.x / 2, levelSize.y * 0.7), vec2(20, 9), spriteAtlas.title);
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
			new ConcreteBlock(vec2(levelSize.x / 2, levelSize.y * 4));
			gameIsNewHiscore = savefileUpdateHiscore(score);
			break;

		case GameState.WON:
			level = 13;
			gameNextLevel();
			level = 31;
			musicInit(level);
			musicOn = true;
			levelStartTime = time;

			gameBonusSet("Lives bonus ", lives * LIVE_BONUS_SCORE, 2);
			break;

		default:
			break;
	}
}

function gameNextLevel() {
	if (transitionFrames > 0) return;

	musicPlayCrash();

	sound_exit.play(player.pos, 3);
	player.jumpToNextLevel();

	gameBlinkFrames = 10;
	gameCameraShake();

	musicOn = false;

	gameBonusSet("Time bonus ", Math.ceil((timeLeft + 1) * TIME_BONUS_SCORE));

	transitionFrames = TRANSITION_FRAMES;
}

function gameUpdate() {
	musicUpdate();

	switch (gameState) {
		case GameState.WON:
			if (gameBonusUpdate()) {
				gameIsNewHiscore = savefileUpdateHiscore(score);
			}

			VictoryRocket.spawnRandom();
			cameraPos = cameraPos.lerp(player.pos, 0.05);
			if (time - levelStartTime > 7) {
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

				// Bonus
				if (level > 0) gameBonusUpdate();

				// Camera

				cameraPos.y += levelSize.y * 0.035 * transProgress;
				cameraScale *= 0.992;
				titleSize *= 0.992;
				cameraPos = cameraPos.lerp(player.pos, transProgress / 10);

				player.drawSize = player.drawSize.scale(1.02);

				transitionFrames--;

				if (transitionFrames <= 0) {
					if (level == 0) score = 0;
					bonusText = undefined;
					gameSkipToLevel(++level);
				}
			} else {
				if (player) timeLeft = TIME_MAX - (time - levelStartTime);

				if (timeLeft <= -1 && level != 0) {
					player.kill(true);
				}

				timeLeft = max(timeLeft, 0);

				if (level == 0) {
					//gameBottomText = levelTexts[level];
					//gameBottomText = "Dodo Dojo: 13 chambers of fowl play";
					gameBottomText = isTouchDevice ? "[Tap to jump]" : "[Space to jump]";

					timeLeft = 0;
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
		if (keyWasPressed("KeyT")) levelStartTime = time - TIME_MAX - 1;
	}

	if (!IS_RELEASE || gameState == GameState.WON) {
		if (keyWasPressed("PageUp")) gameSkipToLevel(++level);
		if (keyWasPressed("PageDown")) gameSkipToLevel(--level);
	}

	cameraShake = cameraShake.scale(-0.9);
	cameraPos = cameraPos.add(cameraShake);
}

function gameCameraShake(strength = 1) {
	strength /= 2;
	cameraShake = cameraShake.add(randInCircle(strength, strength / 2));
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

	fontSize = clamp(fontSize, 10, 20);
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
	let halfTile = (overlayCanvas.height * 0.5) / levelSize.y;

	switch (gameState) {
		case GameState.PLAY:
			//gameDrawHudText(levelTexts[level], overlayCanvas.width * 0.5, overlayCanvas.height - halfTile);

			if (level == 0) {
				if (savefileGetHiscore())
					gameDrawHudText("Hiscore " + savefileGetHiscore(), overlayCanvas.width * 0.5, halfTile);

				let subtitleTopPos = worldToScreen(vec2(levelSize.x / 2, levelSize.y * 0.45));
				let subtitleBottomPos = worldToScreen(vec2(levelSize.x / 2, levelSize.y * 0.4));
				let subtitleColor = "#e0cc5b";

				gameDrawHudText(
					"Enter the Dodo Dojo",
					subtitleTopPos.x,
					subtitleTopPos.y,
					titleSize / 6,
					undefined,
					subtitleColor
				);

				gameDrawHudText(
					"13 chambers of fowl play",
					subtitleBottomPos.x,
					subtitleBottomPos.y,
					titleSize / 6,
					undefined,
					subtitleColor
				);
			} else {
				gameDrawHudText("Lives " + lives, (overlayCanvas.width * 1) / 4, halfTile);
				gameDrawHudText("Score " + score, (overlayCanvas.width * 2) / 4, halfTile);

				let timeColor = "#fff";

				if (timeLeft <= 10 && transitionFrames <= 0) {
					if ((time * 4) % 2 < 1) timeColor = "#f00";
				}

				gameDrawHudText(
					"Time " + Math.ceil(timeLeft),
					(overlayCanvas.width * 3) / 4,
					halfTile,
					undefined,
					undefined,
					timeColor
				);

				if (bonusText) gameDrawHudText(bonusText + bonusAmmount, overlayCanvas.width / 2, halfTile * 3, 0.7);
			}

			break;

		case GameState.GAME_OVER:
			gameDrawScoreStuff(halfTile);

			gameDrawHudText("GAME OVER", overlayCanvas.width / 2, overlayCanvas.height * 0.15, 5);
			gameDrawHudText("Beware the danger of 13 !", overlayCanvas.width / 2, overlayCanvas.height * 0.3, 2);

			gameDrawHudText("Chamber " + level + " of 13", overlayCanvas.width / 2, overlayCanvas.height - 3 * halfTile, 1);

			break;

		case GameState.WON:
			gameDrawScoreStuff(halfTile);

			if (bonusText && time - bonusGivenTime > -1 && !gameIsNewHiscore)
				gameDrawHudText(bonusText + bonusAmmount, overlayCanvas.width / 2, halfTile * 3, 0.7);

			gameDrawHudText("BE FREE BIRD !", overlayCanvas.width / 2, overlayCanvas.height * 0.85, 3);

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

	if (gameBlinkFrames > 0) {
		gameBlinkFrames--;
		let alpha = 0.2 + gameBlinkFrames / 10;
		alpha = min(alpha, 1);

		drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(1, 1, 1, alpha), 0, undefined, true);
	}
}

function gameDrawScoreStuff(halfTile) {
	let scoreText = "Score " + score;
	if (savefileGetHiscore()) {
		scoreText += "          Hiscore " + savefileGetHiscore();
	}
	gameDrawHudText(scoreText, overlayCanvas.width / 2, halfTile);
	if (gameIsNewHiscore && (time * 2) % 2 > 1) gameDrawHudText("NEW HISCORE", overlayCanvas.width / 2, halfTile * 3, 2);
	return scoreText;
}

// BONUS STUFF

function gameBonusSet(text, ammount, initPause = 1) {
	bonusText = text;
	bonusAmmount = ammount;
	bonusGivenTime = time + initPause;
}

// Returns true on the frame it is done counting
function gameBonusUpdate() {
	if (time - bonusGivenTime > 5) bonusText = undefined;
	if (time - bonusGivenTime < 0) return false; // Intial pause
	if (bonusAmmount <= 0) return false;

	if (transitionFrames % 2 == 0) {
		sound_score.play();

		if (bonusAmmount > TIME_BONUS_SCORE) {
			score += TIME_BONUS_SCORE;
			bonusAmmount -= TIME_BONUS_SCORE;
		} else {
			score += bonusAmmount;
			bonusAmmount = 0;
			return true;
		}
	}

	return false;
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ["tiles.png"]);
