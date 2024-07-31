import defaultHandler from './defaultHandler.js';
import sliderHandler from './slider.js';

/**
 * Other Button type handler
 * @param {*} sndType The type of the button
 * @param {*} keyObject The key object
 * @param {*} snd The sound object
 * @param {*} rawDat The raw data
 */
export default function(sndType, keyObject, snd, rawDat) {
  if (sndType == 'fd.sound') defaultHandler(snd, keyObject, rawDat);
  else {
    switch (snd.renderType) {
      default:
        break;
      case 'button':
        defaultHandler(snd, keyObject, rawDat);
        break
      case 'slider':
        sliderHandler(snd, keyObject, rawDat);
        break;
    }
  }
};
