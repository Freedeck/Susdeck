import defaultHandler from "./defaultHandler.js";
import sliderHandler from "./slider.js";
import textHandler from "./textHandler.js";

/**
 * Other Button type handler
 * @param {*} sndType The type of the button
 * @param {*} keyObject The key object
 * @param {*} snd The sound object
 * @param {*} rawDat The raw data
 */
export default function (sndType, keyObject, snd, rawDat) {
	if (sndType === "fd.sound") defaultHandler(snd, keyObject, rawDat);
	else if (sndType === "fd.none") textHandler(snd, keyObject, rawDat, true);
	else if (sndType === "fd.select") textHandler(snd, keyObject, rawDat, true);
	else {
		switch (snd.renderType) {
			case "button":
				defaultHandler(snd, keyObject, rawDat);
				break;
			case "slider":
				sliderHandler(snd, keyObject, rawDat);
				break;
			case "text":
				textHandler(snd, keyObject, rawDat);
				break;
			default:
				defaultHandler(snd, keyObject, rawDat);
				break;
		}
	}
	universal.sendEvent("keyRendered", {keyObject, snd, sndType, rawDat});
}
