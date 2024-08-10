/**
 * Create the default FD button.
 * @param {*} snd Freedeck Button Config
 * @param {*} keyObject Key Object
 * @param {*} raw Raw Key Data
 */
export default function (snd, keyObject, raw) {
  const k = Object.keys(raw)[0];
  keyObject.innerHTML = '<div class="button-text"><p>' + sanitizeXSS(k) + '</div></p>';
  if (snd.data.longPress) {
    const startHolding = (e) => {
      keyObject.dataset.time = 0;
      keyObject.dataset.holding = true;
      keyObject.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      keyObject.style.transform = `scale(0.75)`;
      keyObject.interval = setInterval(() => {
        keyObject.dataset.time = parseInt(keyObject.dataset.time) + 1;  
        keyObject.style.backgroundColor = `rgba(0, 0, 0, ${(parseInt(keyObject.dataset.time) * 0.1) + 0.1})`;
        keyObject.style.transform = `scale(${0.75 + parseInt(keyObject.dataset.time) * 0.05})`;
        if(parseInt(keyObject.dataset.time) >= universal.loadObj('local-cfg').longPressTime || 3){
          stopHolding(e);
          clearInterval(keyObject.interval);
        }
      }, 1000);
    }

    const stopHolding = (e) => {
      keyObject.dataset.holding = false;
      keyObject.style.backgroundColor = snd.data.color ? snd.data.color : '';
      keyObject.style.transform = ``;
      clearInterval(keyObject.interval);
      if(parseInt(keyObject.dataset.time) >= universal.loadObj('local-cfg').longPressTime || 3){
        send(e);
      }
      keyObject.dataset.time = 0;
    }

    keyObject.onmousedown = startHolding;
    keyObject.onmouseup = stopHolding;
    keyObject.onmouseleave = stopHolding;
    keyObject.ontouchstart = startHolding;
    keyObject.ontouchend = stopHolding;
    keyObject.ontouchcancel = stopHolding;
    const send = (e) => {
      universal.send(
        universal.events.keypress,
        JSON.stringify({
          event: e,
          btn: snd,
        }),
      );
    }
  } else {
    keyObject.onclick = (ev) => {
      universal.send(
        universal.events.keypress,
        JSON.stringify({
          event: ev,
          btn: snd,
        }),
      );
    };
  }
  // check if text is bigger than 2 lines (by font size)
  if (universal.loadObj('local-cfg').scroll) {
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