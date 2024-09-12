/** @format */

function savefileGetHiscore() {
	return localStorage["dodo_hs"] | 0;
}

function savefileUpdateHiscore(score) {
	if (score > savefileGetHiscore()) {
		localStorage["dodo_hs"] = score;
		return true;
	}

	return false;
}
