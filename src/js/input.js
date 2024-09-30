/** @format */

let inputJump = 0;
let inputJumpLast = 0;

let inputFrame = 0;

let inputJumpData = {};

// if false it will record
let inputPlaybackDemo = false;

function inputJumpHeld() {
	return inputJump & 1;
}

function inputJumpPressed() {
	return inputJump == 3;
}

function inputJumpReleased(forceRealInput = false) {
	if (forceRealInput) {
		let realInput = inputReadRealJumpInput();
		return realInput == 4;
	}

	return inputJump == 4;
}

function inputReset() {
	inputJump = 0;
	inputFrame = 0;

	if (inputPlaybackDemo && savefileExist("jumpData_" + level)) {
		inputJumpData = savefileGet("jumpData_" + level);
	} else {
		inputJumpData = {};
		inputPlaybackDemo = false;
	}
}

function inputReadRealJumpInput() {
	let space = inputData[0]["Space"];
	let gamepadButton = inputData[1] && inputData[1][0];
	let mouseButton = inputData[0][0];

	return space | gamepadButton | mouseButton;
}

// XXX added to not collide w inputUpdate in littleJs ... sigh

function inputUpdateXXX() {
	if (inputPlaybackDemo && level > 0) {
		// Play back jump data
		let frameData = inputJumpData[inputFrame];
		if (frameData != undefined) inputJump = frameData;
	} else {
		// Play game and record jump data

		inputJump = inputReadRealJumpInput();

		if (inputJump != inputJumpLast) {
			inputJumpData[inputFrame] = inputJump;
		}
	}
	//console.log(inputFrame, inputJump);

	inputFrame++;

	inputJumpLast = inputJump;
}

function inputSaveData() {
	savefileSet("jumpData_" + level, inputJumpData);
}
