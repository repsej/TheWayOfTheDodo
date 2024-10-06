/** @format */

// let SAVEFILE_UPDATE_STATUS = {
// 	NUMBER_LOWER: -1,
// 	NUMBER_SAME: 0,
// 	NUMBER_HIGHER: 1,
// };

function savefileGetNumber(key, defaultValue = 0.0) {
	let retVal = localStorage.getItem(key);

	if (retVal == null) {
		return defaultValue;
	} else {
		return Number(retVal);
	}
}

// Returns the diff
function savefileUpdateNumber(key, value, defaultValue = 0.0) {
	let diff = value - savefileGetNumber(key, defaultValue);

	if (Math.abs(diff) < 0.001) {
		return 0;
	}

	if (diff > 0) {
		localStorage.setItem(key, value);
		return diff;
	} else {
		return diff;
	}
}

function savefileHiscoreGet() {
	return savefileGetNumber("dodo_hs", 0);
}

function savefileHiscoreUpdate(score) {
	return savefileUpdateNumber("dodo_hs", score);
}

function savefileTimeGet(level) {
	return savefileGetNumber("dodo_level" + level);
}

function savefileTimeBonusUpdate(level, time) {
	return savefileUpdateNumber("dodo_level" + level, time);
}

function savefileSet(key, val) {
	localStorage.setItem(key, JSON.stringify(val));
}

function savefileGet(key) {
	return JSON.parse(localStorage.getItem(key));
}

function savefileExist(key) {
	return localStorage.getItem(key) != null;
}
