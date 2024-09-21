/**
 * Create a text-only FD button.
 * @param {*} snd Freedeck Button Config
 * @param {*} keyObject Key Object
 * @param {*} raw Raw Key Data
 */
export default function (snd, keyObject, raw) {
	const k = Object.keys(raw)[0];
	keyObject.innerHTML = `<div class="button-text"><p>${sanitizeXSS(k)}</div></p>`;
}

const sanitizeXSS = (str) => {
	return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
