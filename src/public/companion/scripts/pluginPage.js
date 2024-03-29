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

const loadRepo = (repo, isUnofficial=false) => {
  const li = document.createElement('li');
  li.setAttribute('hovereffect', 'yes');
  li.style.cursor = 'default';
  li.innerText = (isUnofficial ? '(!) ' : '') + repo.title +' - ' + repo.who;
  document.querySelector('.repositories').appendChild(li);

  universal.repositoryManager.getPluginsfromRepo(repo.link).then((plugins) => {
    if (plugins[0].err) {
      li.innerText += ' - Error: ' + plugins[0].msg;
      return;
    }
    plugins.forEach((plugin) => {
      const req = plugin;
      const li = document.createElement('div');
      li.setAttribute('hovereffect', 'yes');
      li.style.cursor = 'default';
      li.className = 'item';
      const name = document.createElement('div');
      name.innerText = isUnofficial ? '(!) ' + req.name : req.name;
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
      const file = document.createElement('button');
      file.onclick = () => {
        universal.send(universal.events.default.download_plugin, JSON.stringify({id: req.id, file: req.file, server: repo}));
      };
      file.innerText = 'Download';
      if (universal.plugins[req.id]) {
        file.innerText = 'Installed';
        file.style.color = 'gray';
        if ( typeof universal.plugins[req.id].version !== 'undefined') {
          if (universal.plugins[req.id].version != req.version) {
            file.innerText = 'Update';
            file.style.color = 'black';
          } else
            if (universal.plugins[req.id].version == req.version) {
              file.innerText = 'Up to date';
              file.style.color = 'black';
              file.onclick = () => {};
            } else {
              file.onclick = () => {};
            }
        } else {
          file.onclick = () => {};
        }
      };
      li.appendChild(file);
      document.querySelector('.marketplace').appendChild(li);
    });
  });
  if (isUnofficial) li.innerHTML += '<a href="#">Remove</a>';
  if (isUnofficial) {
    li.querySelector('a').onclick = () => {
      universal.repositoryManager.unofficial = universal.repositoryManager.unofficial.filter((r) => r.link != repo.link);
      universal.save('repos.community', JSON.stringify(universal.repositoryManager.unofficial));
      document.querySelector('.repositories').removeChild(li);
    };
  }
};

universal.repositoryManager.official.forEach((repo) => {
  loadRepo(repo);
});

universal.repositoryManager.unofficial.forEach((repo) => {
  loadRepo(repo, true);
});

universal.on(universal.events.default.plugin_downloaded, () => {
  universal.sendToast('Plugin downloaded. Restart the server to use it.');
});
