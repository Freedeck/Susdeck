import {universal} from '../../scripts/universal.js';
import './global.js';
import './authfulPage.js';

await universal.init('Companion:PluginViewer');

const seen = {};

Object.keys(universal.plugins).forEach((plugin) => {
  const req = universal.plugins[plugin];
  const li = document.createElement('li');
  li.setAttribute('hovereffect', 'yes');
  li.style.cursor = 'default';
  if (seen[req.name]) return;
  seen[req.name] = true;
  li.innerText = `${req.name}${req.version ? ' v' + req.version : ''}`+ ' - ' + req.id + ' by ' + req.author;
  const a = document.createElement('button');
  a.innerText = 'Disable ' + req.name;
  a.onclick = () => {
    universal.send(universal.events.default.disable_plugin, req.id);
  };
  document.querySelector('.btnlist').appendChild(li);

  document.querySelector('.disabledable').appendChild(a);
  const types = req.types;
  types.forEach((dataObj) => {
    const tmpBtn = document.createElement('button');
    tmpBtn.innerText = dataObj.name+': ' + dataObj.type;
    tmpBtn.onclick = (ev) => {
      universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: {uuid: 0, name: dataObj.name, type: dataObj.type}}));
    };
    document.querySelector('.btns').appendChild(tmpBtn);
  });
});

const dialog = document.createElement('dialog');
document.body.appendChild(dialog);


universal.on(universal.events.default.plugin_downloaded, () => {
  dialog.innerHTML += `<p>Downloaded successfully. Give Freedeck a second to update it's plugin index.</p>`;
});

document.querySelector('#upd').onclick =() => {
  universal.send(universal.events.default.update_plugins);
  if (!dialog.open) dialog.showModal();
  dialog.innerHTML = `<p>Reloading plugins!</p>`;
};

universal.on(universal.events.default.plugins_updated, () => {
  if (!dialog.open) dialog.showModal();
  dialog.innerHTML = `<p>Plugin indexes updated.</p><button id="close">Refresh</button>`;
  document.querySelector('#close').onclick = () => {
    window.location.reload();
  };
});
