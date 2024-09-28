/** @format */

function savefileGet(key, defaultValue = 0.0) {
	return localStorage[key] | defaultValue;
}

function savefileUpdate(key, value, defaultValue = 0.0) {
	if (value > savefileGet(key, defaultValue)) {
		localStorage[key] = value;
		return true;
	}

	return false;
}

function savefileHiscoreGet() {
	return savefileGet("dodo_hs", 0);
}

function savefileHiscoreUpdate(score) {
	return savefileUpdate("dodo_hs", score);
}

function savefileTimeGet(level) {
	return savefileGet("dodo_level" + level) / 1000;
}

function savefileTimeUpdate(level, time) {
	return savefileUpdate("dodo_level" + level, time * 1000);
}
