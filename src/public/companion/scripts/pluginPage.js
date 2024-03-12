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
  li.innerText = req.name + ' - ' + req.id + ' by ' + req.author;
  document.querySelector('.btnlist').appendChild(li);
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

// universal._tyc.forEach((data) => {
//   const req = JSON.parse(data);
//   const li = document.createElement('li');
//   li.setAttribute('hovereffect', 'yes');
//   li.style.cursor = 'default';
//   if (seen[req.response.instance.name]) return;
//   seen[req.response.instance.name] = true;
//   li.innerText = req.response.instance.name + ' - ' + req.requested + ' by ' + req.response.instance.author;
//   document.querySelector('.btnlist').appendChild(li);
//   const types = req.response.instance.types;
//   types.forEach((dataObj) => {
//     const tmpBtn = document.createElement('button');
//     tmpBtn.innerText = dataObj.name+': ' + dataObj.type;
//     tmpBtn.onclick = (ev) => {
//       universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: {uuid: 0, name: dataObj.name, type: dataObj.type}}));
//     };
//     document.querySelector('.btns').appendChild(tmpBtn);
//   });
// });
