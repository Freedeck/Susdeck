HTMLElement.prototype.setHTML = function(html) {
  this.innerHTML = html;
};

universal.listenFor('init', () => {
  const login = document.createElement('li');
  login.id = 'constat';
  login.style.fontSize= '.75em';
  login.style.display = 'block';
  document.querySelector('#sidebar > ul').appendChild(login);

  universal.uiSounds.playSound('page_enter');
});

document.onkeydown = (ev) => universal.uiSounds.playSound('int_type');

const sidebar = [
  {'Home': 'index.html'},
  {'Plugins': 'plugins.html'},
  {'Marketplace': 'marketplace.html'},
  {'Settings': 'settings.html'},
  {'Connect': '/fdconnect.html'},
  // {'Webpack Recompile': '+universal.send(universal.events.default.recompile)'}
];

const sidebarEle = document.createElement('div');
sidebarEle.id = 'sidebar';
const sidebarUl = document.createElement('ul');
sidebarEle.appendChild(sidebarUl);
sidebarUl.setHTML('<li style="font-size: .65em; background: none; margin: 0 auto;"><h2>Freedeck</h2></li>');
sidebar.forEach((itm) => {
  const name = Object.keys(itm)[0];
  const val = itm[name];
  if (val.startsWith('+')) {
    const ele = document.createElement('li');
    ele.setHTML(`<a onclick="${val.substring(1)}">${name}</a>`);
    sidebarUl.appendChild(ele);
    return;
  }
  const ele = document.createElement('li');
  ele.setAttribute('hovereffect', 'yes');
  ele.setHTML(`<a href="${val}">${name}</a>`);
  sidebarUl.appendChild(ele);
});

document.body.appendChild(sidebarEle);

import './HookLoader.js';
