/** @format */

let spriteAtlas, score, level, transitionFrames, timeLeft;

let bonusText, bonusAmmount, bonusGivenTime;

let GameState = {
	PLAY: 0,
	GAME_OVER: 1,
	WON: 2,
	TRANSITION: 3,
};

let gameState = GameState.PLAY;
const TRANSITION_FRAMES = 240;
const TIME_BONUS_SCORE = 100;
const LIVE_BONUS_SCORE = 5000;
const TIME_MAX = 46;
const LIVES_START = 3;

let gameBottomText = undefined;
let gameBottomTopText = undefined;
let lives = undefined;
let titleSize;
let gameNewHiscoreStatus = undefined;
let gameBestTimeBonusDiff = undefined;
let gameBlinkFrames = 0;
let cameraShake = vec2();
let gameLastDiedOnLevel = undefined;

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
		demoDoor: tile(10),
		title: tile(vec2(48, 32), vec2(48, 32)),
	};

	// enable touch gamepad on touch devices
	touchGamepadEnable = true;
	gameNewHiscoreStatus = undefined;

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

	gameLastDiedOnLevel = undefined;

	gameBottomText = undefined;
	gameBottomTopText = undefined;
	gameBlinkFrames = 15;

	inputPlaybackDemo = false;

	if (isTouchDevice) particleEmitRateScale = 0.5;
}

function gameSetState(newState) {
	gameBottomText = undefined;
	gameBottomTopText = undefined;

	gameState = newState;

	switch (newState) {
		case GameState.GAME_OVER:
			gameBlinkFrames = 15;
			levelStartTime = time;
			levelBuild(14);
			musicInit(22);
			new ConcreteBlock(vec2(levelSize.x / 2, levelSize.y * 4));

			if (!inputPlaybackDemo) gameNewHiscoreStatus = savefileHiscoreUpdate(score);

			break;

		case GameState.WON:
			gameSkipToLevel(13);
			level = 31;
			musicInit(level);
			// musicOn = true;
			levelStartTime = time;

			gameBonusSet("Lives bonus ", lives * LIVE_BONUS_SCORE, 2);
			break;

		case GameState.TRANSITION:
			transitionFrames = TRANSITION_FRAMES;
			break;

		default:
			break;
	}
}

function gameNextLevel(checkBestTime = false) {
	if (transitionFrames > 0) return;

	sound_exit.play(player.pos, 3);
	player.jumpToNextLevel();

	gameBlinkFrames = 10;
	gameCameraShake();

	let timeBonus = Math.round(timeLeft * TIME_BONUS_SCORE);

	gameBonusSet("Time bonus ", timeBonus, 2);

	gameBestTimeBonusDiff = undefined;

	if (checkBestTime && !inputPlaybackDemo) {
		if (level > 0 && gameLastDiedOnLevel != level) {
			gameBestTimeBonusDiff = savefileTimeBonusUpdate(level, timeBonus);
			if (gameBestTimeBonusDiff > 0) {
				inputSaveData();
			}
		}
	}

	gameSetState(GameState.TRANSITION);
}

function gameUpdate() {
	inputUpdateXXX();

	musicUpdate();

	switch (gameState) {
		case GameState.WON:
			if (gameBonusUpdate()) {
				if (!inputPlaybackDemo) gameNewHiscoreStatus = savefileHiscoreUpdate(score);
			}

			VictoryRocket.spawnRandom();
			cameraPos = cameraPos.lerp(player.pos, 0.05);
			if (time - levelStartTime > 7) {
				if (!gameBottomText) sound_exitAppear.play();
				gameBottomText = "[Press jump to start new game]";
				if (inputJumpReleased(true)) gameInit();
			}
			break;

		case GameState.GAME_OVER:
			gameBottomText = "Chamber " + level + " of 13";

			if (time - levelStartTime > 5) {
				if (!gameBottomText) sound_exitAppear.play();
				gameBottomTopText = "[Press jump to start new game]";
				if (inputJumpReleased(true)) gameInit();
			}
			cameraScale = min(mainCanvas.width / levelSize.x, mainCanvas.height / levelSize.y);
			cameraPos = levelSize.scale(0.5);
			break;

		case GameState.TRANSITION:
			let transProgress = (TRANSITION_FRAMES - transitionFrames) / TRANSITION_FRAMES;
			cameraPos = cameraPos.lerp(player.pos, transProgress / 10);

			if (level > 0) gameBottomText = "Chamber " + level + " of 13";

			if (transitionFrames > 0) {
				// Bonus
				if (level > 0) gameBonusUpdate();

				// Camera

				cameraPos.y += levelSize.y * 0.035 * transProgress;
				cameraScale *= 0.992;
				titleSize *= 0.992;

				player.drawSize = player.drawSize.scale(1.017);

				transitionFrames--;

				if (transitionFrames <= 0) {
					if (inputPlaybackDemo) {
						gameSkipToLevel(++level);
					} else {
						bonusText = undefined;

						if (!gameBottomTopText) sound_exitAppear.play();
						gameBottomTopText = "[Jump to continue]";

						if (level == 0) {
							score = 0;
							gameSkipToLevel(++level);
						}
					}
				}
			} else {
				if (inputJumpReleased(true)) {
					gameSkipToLevel(++level);
				}
			}

			break;

		case GameState.PLAY:
			if (player) timeLeft = TIME_MAX - (time - levelStartTime);

			if (timeLeft < 0 && level != 0) {
				player.kill(true);
			}

			timeLeft = max(timeLeft, 0);

			if (level == 0) {
				gameBottomText = isTouchDevice
					? "[Tap to jump.  Hold for wall jump.]"
					: "[Space to jump.  Hold for wall jump.]";

				timeLeft = 0;
			} else {
				gameBottomText = "Chamber " + level + " of 13";
				// if (levelTexts[level]) gameBottomText += ". " + levelTexts[level];
			}
			cameraScale = min(mainCanvas.width / levelSize.x, mainCanvas.height / levelSize.y);
			cameraPos = levelSize.scale(0.5);
			break;
	}

	// quit demo playback
	if (inputPlaybackDemo && inputJumpPressed(true)) {
		gameInit();
		return;
	}

	if (!IS_RELEASE) {
		// Toggle music on
		if (keyWasPressed("KeyM")) {
			musicOn = !musicOn;
		}

		// GAME OVER
		if (keyWasPressed("KeyG")) {
			lives = 1;
			player?.kill();
		}

		// WIN
		if (keyWasPressed("KeyW")) {
			level = 13;
			gameNextLevel();
		}

		// KILL
		if (keyWasPressed("KeyK")) player.kill();

		// Next level
		if (keyWasPressed("KeyN")) gameNextLevel();

		// 1 sec to time out
		if (keyWasPressed("KeyT")) levelStartTime = time - TIME_MAX - 1;

		// Start demo
		if (keyWasPressed("KeyD")) {
			if (level == 0) {
				gameNextLevel();
				inputPlaybackDemo = true;
			}
		}

		// Retry level
		if (keyWasPressed("KeyR")) gameSkipToLevel(level);
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
	gameBottomText = undefined;
	gameBottomTopText = undefined;

	if (gameState == GameState.WON) {
		musicInit(level);
		return;
	}

	gameBlinkFrames = 15;

	if (newLevel == 14) {
		gameSetState(GameState.WON);
		return;
	}

	level = mod(newLevel, levelData.length);
	levelBuild(level);
	musicInit(level);
	//musicOn = true;

	transitionFrames = 0;
	bonusText = undefined;

	gameSetState(GameState.PLAY);
	inputReset();

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
		case GameState.TRANSITION:
			let bestTime = savefileTimeGet(level);
			if (bestTime > 0) {
				let bestText = undefined;

				console.log("best, diff: ", bestTime, gameBestTimeBonusDiff);

				if (gameBestTimeBonusDiff != undefined) {
					// let bonusDiffAsTime =
					// 	Math.floor(Math.abs(gameBestTimeBonusDiff) / 100) + "." + (Math.abs(gameBestTimeBonusDiff) % 100);

					let bonusDiffAsTime = Math.abs(gameBestTimeBonusDiff).toString().padStart(4, "0");
					bonusDiffAsTime = bonusDiffAsTime.slice(0, 2) + "." + bonusDiffAsTime.slice(2);

					if (gameBestTimeBonusDiff == 0) {
						bestText = "Best tied";
					} else if (gameBestTimeBonusDiff > 0) {
						bestText = (time * 2) % 2 > 1 ? "NEW BEST +" + bonusDiffAsTime : "";
					} else {
						bestText = "Best -" + bonusDiffAsTime;
					}
				}

				if (bestText) gameDrawHudText(bestText, (overlayCanvas.width * 3) / 4, halfTile * 2, 0.7);
			}

		// fall-thru !

		case GameState.PLAY:
			//gameDrawHudText(levelTexts[level], overlayCanvas.width * 0.5, overlayCanvas.height - halfTile);

			if (level == 0) {
				if (savefileHiscoreGet())
					gameDrawHudText("Hiscore " + savefileHiscoreGet(), overlayCanvas.width * 0.5, halfTile);

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
					"Time " + timeLeft.toFixed(2),
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

			break;

		case GameState.WON:
			gameDrawScoreStuff(halfTile);

			if (bonusText && time - bonusGivenTime > -1 && gameNewHiscoreStatus == undefined)
				gameDrawHudText(bonusText + bonusAmmount, overlayCanvas.width / 2, halfTile * 3, 0.7);

			gameDrawHudText("FREEBIRD", overlayCanvas.width / 2, overlayCanvas.height - halfTile * 8, 4);
			gameDrawHudText("YOU TAEK-WON-DODO", overlayCanvas.width / 2, overlayCanvas.height - halfTile * 5, 2);

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

	if (gameBottomTopText)
		gameDrawHudText(gameBottomTopText, overlayCanvas.width * 0.5, overlayCanvas.height - halfTile * 3);

	if (player) player.renderTop(); // On top of everything !

	if (inputPlaybackDemo) {
		if ((time * 2) % 2 > 1) {
			gameDrawHudText("DEMO PLAYBACK", overlayCanvas.width / 4, overlayCanvas.height - halfTile);
		} else {
			gameDrawHudText("[Jump to quit]", (overlayCanvas.width * 3) / 4, overlayCanvas.height - halfTile);
		}
	}

	mainContext.drawImage(overlayCanvas, 0, 0);

	// if (player) player.renderTop(); // On top of everything !

	if (gameBlinkFrames > 0) {
		gameBlinkFrames--;
		let alpha = 0.2 + gameBlinkFrames / 10;
		alpha = min(alpha, 1);

		drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(1, 1, 1, alpha), 0, undefined, true);
	}
}

function gameDrawScoreStuff(halfTile) {
	let scoreText = "Score " + score;
	if (savefileHiscoreGet()) {
		scoreText += "          Hiscore " + savefileHiscoreGet();
	}
	gameDrawHudText(scoreText, overlayCanvas.width / 2, halfTile);

	if (!inputPlaybackDemo && gameNewHiscoreStatus >= 0) {
		if (gameNewHiscoreStatus == 0) {
			gameDrawHudText("HISCORE TIED", overlayCanvas.width / 2, halfTile * 3, 2);
		} else if (gameBestTimeBonusDiff > 0) {
			if ((time * 2) % 2 > 1) gameDrawHudText("NEW HISCORE", overlayCanvas.width / 2, halfTile * 3, 2);
		}
	}

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
