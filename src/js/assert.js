/** @format */

/**
 *
 * @param {boolean} test
 * @param {string} text
 */
function assert(test, text = "[Like, some error]") {
	if (IS_RELEASE) return;

	if (!test) {
		console.error("ASSERT FAILED: ", text);
		debugger;
	}
}
