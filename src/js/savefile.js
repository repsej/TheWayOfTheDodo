/** @format */

var SAVEFILE_UPDATE_STATUS = {
	NUMBER_LOWER: -1,
	NUMBER_SAME: 0,
	NUMBER_HIGHER: 1,
};

function savefileGetNumber(key, defaultValue = 0.0) {
	let retVal = localStorage.getItem(key);

	if (retVal == null) {
		return defaultValue;
	} else {
		return Number(retVal);
	}
}

function savefileUpdateNumber(key, value, defaultValue = 0.0) {
	let diff = value - savefileGetNumber(key, defaultValue);

	if (Math.abs(diff) < 0.001) {
		return SAVEFILE_UPDATE_STATUS.NUMBER_SAME;
	}

	if (diff > 0) {
		localStorage.setItem(key, value);
		return SAVEFILE_UPDATE_STATUS.NUMBER_HIGHER;
	} else {
		return SAVEFILE_UPDATE_STATUS.NUMBER_LOWER;
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

function savefileTimeUpdate(level, time) {
	return savefileUpdateNumber("dodo_level" + level, time);
}
