/** @format */

let inputJump = 0;
let inputJumpLast = 0;

let inputFrame = 0;

let inputJumpData = [];

// if false it will record
let inputPlayback = false;

function inputJumpHeld() {
	return inputJump & 1;
}

function inputJumpPressed() {
	return inputJump == 3;
}

function inputJumpReleased() {
	return inputJump == 4;
}

function inputReset() {
	debugger;
	inputJump = 0;
	inputFrame = 0;
	inputJumpData = [];
}

// XXX added to not collide w inputUpdate in littleJs ... sigh

function inputUpdateXXX() {
	let space = inputData[0]["Space"];
	let gamepadButton = inputData[1] && inputData[1][0];
	let mouseButton = inputData[0][0];

	inputJump = space | gamepadButton | mouseButton;

	if (inputJump != inputJumpLast) {
		inputJumpData.push({ inputFrame, inputJump });
	}

	//console.log(inputFrame, inputJump);

	inputFrame++;

	inputJumpLast = inputJump;
}
