/**
 * Create a text-only FD button.
 * @param {*} snd Freedeck Button Config
 * @param {*} keyObject Key Object
 * @param {*} raw Raw Key Data
 * @param {boolean} isNothing Is this a nothing button?
 */
export default function (snd, keyObject, raw, isNothing = false) {
	const k = Object.keys(raw)[0];
	keyObject.innerText = k;
	if (isNothing && universal.name !== "Companion") {
		keyObject.style.opacity = 0.125;
		// Fade on non-companion, to show it's nothing and needs to be set
	}
}
