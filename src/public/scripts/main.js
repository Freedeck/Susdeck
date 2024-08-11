import {universal} from './universal.js';
import './HookLoader.js';
import {UI} from './ui.js';
import '../companion/scripts/authfulPage.js';

await universal.init('Main');

window.onscroll = function() {
  window.scrollTo(0, 0);
};


let touchstartX = 0;
let touchendX = 2500;

const checkDirection = () => {
  const currentPage = universal.page;
  const range = touchendX - touchstartX;
  if (range < -50) {
    // go page up
    if (UI.Pages[currentPage + 1]) {
      universal.page++;
      universal.save('page', universal.page);
      UI.reloadSounds();
      universal.sendEvent('page_change');
    } else {
      /* empty */
    }
  }
  if (range > 50) {
    // go page down
    if (UI.Pages[currentPage - 1]) {
      universal.page--;
      universal.save('page', universal.page);
      UI.reloadSounds();
      universal.sendEvent('page_change');
    } else {
      /* empty */
    }
  }
};

document.addEventListener('keydown', (ev) => {
  if (ev.key == 'ArrowLeft') {
    if (UI.Pages[universal.page - 1]) {
      universal.page--;
      universal.save('page', universal.page);
      universal.uiSounds.playSound('page_down');
      UI.reloadSounds();
      universal.sendEvent('page_change');
    }
  }
  if (ev.key == 'ArrowRight') {
    if (UI.Pages[universal.page + 1]) {
      universal.page++;
      universal.save('page', universal.page);
      universal.uiSounds.playSound('page_up');
      UI.reloadSounds();
      universal.sendEvent('page_change');
    }
  }
});

if(universal.config.profile != universal.load('profile')) {
  universal.save('profile', universal.config.profile);
  universal.page = 0;
  universal.save('page', universal.page);
  UI.reloadSounds();
}

universal.on(universal.events.default.config_changed, (e) => {
  e = JSON.parse(e);
  document.documentElement.style.setProperty('--fd-font-size', e['font-size'] + 'px');
  document.documentElement.style.setProperty('--fd-tile-w', e.buttonSize + 'rem');
  document.documentElement.style.setProperty('--fd-tile-h', e.buttonSize + 'rem');
  let tc = 'repeat(5, 2fr)';
  if(e.tileRows) tc = tc.replace('5', e.tileRows);
  document.documentElement.style.setProperty('--fd-template-columns', tc);
})

let lcfg = universal.lclCfg();
document.documentElement.style.setProperty('--fd-font-size', lcfg['font-size'] + 'px');
document.documentElement.style.setProperty('--fd-tile-w', lcfg.buttonSize + 'rem');
document.documentElement.style.setProperty('--fd-tile-h', lcfg.buttonSize + 'rem');

let tc = 'repeat(5, 2fr)';
if(lcfg.tileRows) tc = tc.replace('5', lcfg.tileRows);
document.documentElement.style.setProperty('--fd-template-columns', tc);

window.addEventListener('touchstart', (e) => {
  touchstartX = e.changedTouches[0].screenX;
});

window.addEventListener('mousedown', (e) => {
  touchstartX = e.screenX;
});

document.addEventListener('mouseup', (e) => {
  touchendX = e.screenX;
  checkDirection();
});

document.addEventListener('touchend', (e) => {
  touchendX = e.changedTouches[0].screenX;
  checkDirection();
});

if (document.querySelector('#version')) {
  document.querySelector('#version').innerText = 'Freedeck Server: ' + universal._information.server + '\nFreedeck SocketHandler: ' + universal._information.version;
}
