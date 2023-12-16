import {universal} from './universal.js';

await universal.init('Main');


/**
 * @also-in companion/scripts/main.js
 * @name reloadSounds
 * @description Reload the sounds in the client's DOM.
 */
function reloadSounds() {
  universal.config.sounds = universal.config.profiles[universal.config.profile];
  document.querySelectorAll('#keys > .button').forEach((key) => {
    key.remove();
  });
  universal.keySet();
  universal.config.sounds.forEach((sound) => {
    const k = Object.keys(sound)[0];
    const snd = sound[k];
    let keyObject = document.querySelector('.k-' + snd.pos);

    if (snd.pos < ((universal.config.iconCountPerPage) * universal.page)) return;
    if (!keyObject) {
      if (universal.page == 0) return;
      const newPos = Math.abs(snd.pos - (universal.config.iconCountPerPage * universal.page)) - 1;
      snd.pos = newPos;
      keyObject = document.querySelector('.k-' + snd.pos);
    };
    try {
      keyObject.setAttribute('data-interaction', JSON.stringify(snd));
      keyObject.innerText = k;
      keyObject.className = keyObject.className.replace('unset', '');
      keyObject.onclick = (ev) => {
        universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: snd}));
      };
    } catch (e) {
    }
  });
}
reloadSounds();

const Pages = {};
for (let i = 0; i < (universal.config.sounds.length / universal.config.iconCountPerPage); i++) {
  Pages[i] = true;
}
let touchstartX = 0;
let touchendX = 2500;

const checkDirection = () => {
  const currentPage = universal.page;
  const range = touchendX - touchstartX;
  if (range < -50) {
    // go page up
    if (Pages[currentPage + 1]) {
      universal.page ++;
      reloadSounds();
    } else {
      /* empty */
    }
  }
  if (range > 50) {
    // go page down
    if (Pages[currentPage - 1]) {
      universal.page --;
      reloadSounds();
    } else {
      /* empty */
    }
  }
};

document.addEventListener('touchmove', (event) => {
  event.preventDefault();
});

document.addEventListener('touchstart', (e) => {
  touchstartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
  touchendX = e.changedTouches[0].screenX;
  checkDirection();
});
