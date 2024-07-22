const Pages = {};

import otherHandler from './ui/otherHandler.js';
import sliderHandler from './ui/slider.js';

/**
 * @name reloadProfile
 * @description Reload the current profile
 */
function reloadProfile() {
  universal.config.sounds = universal.config.profiles[universal.config.profile];
  for (
    let i = 0;
    i < universal.config.sounds.length / universal.config.iconCountPerPage;
    i++
  ) {
    Pages[i] = true;
  }
}

/**
 * @name reloadSounds
 * @description Reload all of the sounds in the client's DOM.
 */
function reloadSounds() {
  universal.page = universal.load('page') != '\x9Eée' ? parseInt(universal.load('page')) : 0;
  reloadProfile();
  document.querySelectorAll('#keys > .button').forEach((key) => {
    key.remove();
  });
  if (document.querySelector('.k')) {
    document.querySelectorAll('.k').forEach((k) => {
      k.remove();
    });
  }
  if (document.querySelector('.cpage')) {
    document.querySelector('.cpage').innerText = 'Page: ' + (universal.page + 1) + '/' + Object.keys(Pages).length;
  }
  universal.keySet();
  universal.config.sounds.forEach((sound) => {
    const k = Object.keys(sound)[0];
    const snd = sound[k];
    let keyObject = document.querySelector('.k-' + snd.pos);

    if (snd.pos < universal.config.iconCountPerPage * universal.page) return;
    if (!keyObject) {
      if (universal.page == 0) return;
      const newPos = snd.pos - universal.config.iconCountPerPage * universal.page;
      snd.pos = newPos;
      keyObject = document.querySelector('.k-' + snd.pos);
      snd.pos = newPos + universal.config.iconCountPerPage * universal.page;
    }
    try {
      keyObject.setAttribute('data-interaction', JSON.stringify(snd));
      if (snd.data.icon) {
        keyObject.style.backgroundImage = 'url("' + snd.data.icon + '")';
      }
      if (snd.data.color) keyObject.style.backgroundColor = snd.data.color;
      keyObject.innerText = k;
      keyObject.className = keyObject.className.replace('unset', '');
      keyObject.onclick = (ev) => {
        universal.send(
            universal.events.keypress,
            JSON.stringify({
              event: ev,
              btn: snd,
            }),
        );
      };

      // check if two sounds share the same pos, if they do make this button color yellow
      const sounds = universal.config.sounds.filter((sound) => {
        const ev = universal.page > 0 ? 1 : 0;
        const k = Object.keys(sound)[0];
        return (
          sound[k].pos == snd.pos + universal.page * universal.config.iconCountPerPage + ev
        );
      });
      if (sounds.length > 1) {
        keyObject.style.background = 'yellow';
      }
    } catch (e) { }
    otherHandler(snd.type, keyObject, snd);
  });
  // document.getElementById('keys').style.maxHeight = document.querySelectorAll('.k').length * (10*12)/window.innerWidth + '%';
}

export const UI = {
  reloadSounds,
  reloadProfile,
  Pages,
};
