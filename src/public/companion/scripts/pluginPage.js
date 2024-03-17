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

universal.repositoryManager.official.forEach((repo) => {
  const li = document.createElement('li');
  li.setAttribute('hovereffect', 'yes');
  li.style.cursor = 'default';
  li.innerText = repo;
  document.querySelector('.repositories').appendChild(li);

  universal.repositoryManager.getPluginsfromRepo(repo).then((plugins) => {
    plugins.forEach((plugin) => {
      const req = plugin;
      const li = document.createElement('div');
      li.setAttribute('hovereffect', 'yes');
      li.style.cursor = 'default';
      li.className = 'item';
      const name = document.createElement('div');
      name.innerText = req.name;
      li.appendChild(name);
      const author = document.createElement('div');
      author.innerText = req.author;
      li.appendChild(author);
      const version = document.createElement('div');
      version.innerText = 'v' + req.version;
      li.appendChild(version);
      const desc = document.createElement('div');
      desc.innerText = req.description;
      li.appendChild(desc);
      const file = document.createElement('a');
      file.href = req.file;
      file.download = req.file;
      file.innerText = 'Download';
      li.appendChild(file);
      document.querySelector('.marketplace').appendChild(li);
    });
  });
});
