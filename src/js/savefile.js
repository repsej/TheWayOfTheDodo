/** @format */

function savefileGetHiscore() {
	return localStorage["hiscore"] | 0;
}

function savefileUpdateHiscore(score) {
	if (score > savefileGetHiscore()) {
		localStorage["hiscore"] = score;
		return true;
	}

	return false;
}
