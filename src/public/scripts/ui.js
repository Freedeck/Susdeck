const Pages = {};

import otherHandler from './ui/otherHandler.js';

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
      if(snd.pos >= universal.config.iconCountPerPage * (universal.page + 1)) return;
      keyObject.setAttribute('data-interaction', JSON.stringify(snd));
      keyObject.setAttribute('data-name', k);
      keyObject.className = keyObject.className.replace('unset', '');

      if (snd.data.icon) keyObject.style.backgroundImage = 'url("' + snd.data.icon + '")';
      if (snd.data.color) keyObject.style.backgroundColor = snd.data.color;

      otherHandler(snd.type, keyObject, snd, sound);

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
    } catch (e) {
      console.log('while rendering sound: ' + k, sound[k].pos, universal.page, sound[k].pos - universal.config.iconCountPerPage * universal.page);
      console.error(e);
    }
  });
  // document.getElementById('keys').style.maxHeight = document.querySelectorAll('.k').length * (10*12)/window.innerWidth + '%';
}

export const UI = {
  reloadSounds,
  reloadProfile,
  Pages,
};
