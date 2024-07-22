
import sliderHandler from './slider.js';

/**
 * Other Button type handler
 * @param {*} sndType The type of the button
 * @param {*} keyObject The key object
 * @param {*} snd The sound object
 */
export default function(sndType, keyObject, snd) {
  if (sndType == 'Ui.NewSlider') {
    sliderHandler(snd, keyObject);
  }
};
