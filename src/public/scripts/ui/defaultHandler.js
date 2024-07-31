/**
 * Create the default FD button.
 * @param {*} snd Freedeck Button Config
 * @param {*} keyObject Key Object
 * @param {*} raw Raw Key Data
 */
export default function(snd, keyObject, raw) {
  const k = Object.keys(raw)[0];
  keyObject.innerText = k;
  keyObject.onclick = (ev) => {
    universal.send(
        universal.events.keypress,
        JSON.stringify({
          event: ev,
          btn: snd,
        }),
    );
  };
};
