/**
 * Create the default FD button.
 * @param {*} snd Freedeck Button Config
 * @param {*} keyObject Key Object
 * @param {*} raw Raw Key Data
 */
export default function(snd, keyObject, raw) {
  const k = Object.keys(raw)[0];
  keyObject.innerHTML = '<div class="button-text"><p>' + sanitizeXSS(k) + '</div></p>';
  keyObject.onclick = (ev) => {
    universal.send(
        universal.events.keypress,
        JSON.stringify({
          event: ev,
          btn: snd,
        }),
    );
  };
  // check if text is bigger than 2 lines (by font size)
  if(universal.loadObj('local-cfg').scroll) {
    let txth = keyObject.querySelector('p');
    let size = txth.clientHeight;
    if (size > 40) {
      txth.classList.add('too-big')
    }
  }
};

const sanitizeXSS = (str) => {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};