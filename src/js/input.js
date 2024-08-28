/** @format */

function inputJumpHeld() {
	return keyIsDown("Space") || gamepadIsDown(0) || mouseIsDown(0);
}

function inputJumpPressed() {
	return keyWasPressed("Space") || gamepadWasPressed(0) || mouseWasPressed(0);
}

function inputJumpReleased() {
	return keyWasReleased("Space") || gamepadWasReleased(0) || mouseWasReleased(0);
}
