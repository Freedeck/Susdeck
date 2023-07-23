/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const pages = [
  {
    name: 'Home',
    page: 'index.html',
    icon: 'img/home.svg'
  },
  {
    name: 'Themes',
    page: 'themes.html',
    icon: 'img/themes.svg'
  },
  {
    name: 'Soundboard',
    page: 'soundboard.html',
    icon: 'img/sounds.svg'
  },
  {
    name: 'Icon Editor',
    page: 'iconEditor.html',
    icon: 'img/icon.svg'
  },
  {
    name: 'Settings',
    page: 'settings.html',
    icon: 'img/settings.svg'
  },
  {
    name: 'Experiments',
    page: 'experiments.html',
    icon: 'img/experiments.svg',
    experimental: true
  }
];

const experiments = [
  {
    name: 'Show Notification Log in Settings',
    html: '<h1>DANGEROUS EXPERIMENT</h1><p>This will make your settings page take substantially longer to load.</p>'
  }
];

Susaudio.init();

const side-nav = document.createElement('div');
side-nav.id = 'sidebar';
const tooltip = document.createElement('p');
tooltip.id = 'icon-tip';
document.body.appendChild(tooltip);

pages.forEach(page => {
  if (page.experimental && universal.load('experiments') !== 'true') return;
  const btn = document.createElement('a');
  btn.href = page.page;
  const btnImg = document.createElement('img');
  btnImg.src = page.icon;
  btnImg.alt = page.page + ' Icon';
  btnImg.width = '32';
  btnImg.height = '32';
  btn.onmouseenter = (ev) => {
    tooltip.innerText = page.name;
    tooltip.style.animationName = 'goUp';
  };
  btn.onmouseleave = (ev) => {
    tooltip.innerText = '';
    tooltip.style.animationName = '';
  };
  btn.appendChild(btnImg);
  side-nav.appendChild(btn);
});

document.body.appendChild(side-nav);

document.querySelector('#topbar > button').onclick = () => {
  window.close();
};

experiments.forEach(experiment => {
  if (!document.body.contains(document.querySelector('#experiments'))) return;
  document.querySelector('#exp-count').innerText = `${experiments.length} experiment${experiments.length > 1 ? 's' : ''} available`;
  const newDiv = document.createElement('div');
  if (!universal.load('experiments_list')) universal.save('experiments_list', JSON.stringify([]));
  const expl = JSON.parse(universal.load('experiments_list'));
  const exists = expl.find(elem => elem === JSON.stringify(experiment));
  const existsString = exists ? 'ON' : 'OFF';
  const enableBtn = document.createElement('button');
  enableBtn.innerText = 'Toggle Experiment';
  enableBtn.onclick = () => {
    if (!universal.load('experiments_list')) universal.save('experiments_list', JSON.stringify([]));
    const expl = JSON.parse(universal.load('experiments_list'));
    const exists = expl.find(elem => elem === JSON.stringify(experiment));
    if (exists) {
      universal.sendToast('Experiment toggled off');
      expl.splice(expl.indexOf(JSON.stringify(experiment)), 1);
      const exists = expl.find(elem => elem === JSON.stringify(experiment));
      newDiv.innerHTML = `${exists ? 'ON' : 'OFF'} <p>${experiment.name}</p>${experiment.html}`;
      newDiv.appendChild(enableBtn);
    } else {
      universal.sendToast('Experiment toggled on');
      expl.push(JSON.stringify(experiment));
      const exists = expl.find(elem => elem === JSON.stringify(experiment));
      newDiv.innerHTML = `${exists ? 'ON' : 'OFF'} <p>${experiment.name}</p>${experiment.html}`;
      newDiv.appendChild(enableBtn);
    }
    universal.save('experiments_list', JSON.stringify(expl));
  };
  newDiv.className = 'experiment';
  newDiv.innerHTML = `${existsString} <p>${experiment.name}</p>${experiment.html}`;
  newDiv.appendChild(enableBtn);
  document.querySelector('#experiments').appendChild(newDiv);
});

document.body.onload = () => {
  const freedeckLogo = document.createElement('img');
  freedeckLogo.src = '../assets/icons/companion.png';
  freedeckLogo.className = 'freedeck-logo';
  document.body.appendChild(freedeckLogo);
};

function enableExperiments () {
  if (confirm('Are you sure you want to turn on experiments?')) {
    if (universal.load('experiments') === 'true') {
      if (!confirm('Experiments is already enabled, do you want to turn off experiments?')) return;
      universal.save('experiments', false);
      universal.log('Experiments', 'LocalStorage Experiments off');
      universal.sendToast('Experiments disabled.');
      // Clear the user's custom theme
      universal.remove('experiments_list');
      universal.log('Experiments', 'Removed theme, requesting refresh');
      universal.socket.emit('c-change');
      return;
    }
    universal.save('experiments', true);
    universal.save('experiments_list', JSON.stringify([]));

    universal.sendToast('Experiments enabled.');
    universal.socket.emit('c-change');
  }
}

function importTheme () {
  theme = document.querySelector('#theme-import').value;
  if (theme === '' || theme === ' ') {
    universal.remove('custom_theme');
    universal.socket.emit('c-del-theme', theme);
    universal.socket.emit('c-change');
    return;
  }
  universal.save('custom_theme', theme);
  universal.socket.emit('c-send-theme', theme);
  universal.socket.emit('c-change');
}

function removeTheme () {
  theme = document.querySelector('#theme-import').value;
  universal.remove('custom_theme');
  universal.socket.emit('c-del-theme', theme);
  universal.socket.emit('c-change');
}

if (document.body.dataset.page) {
  document.title = 'Freedeck: Companion - ' + document.body.dataset.page;
}

document.querySelector('#sidebar').onmouseover = () => {
  const rootElem = document.querySelector(':root');
  rootElem.style.setProperty('--sd-rotationDegrees', Math.ceil(Math.random() * 15) + 'deg');
};

const sharedStylesheet = document.createElement('link');
sharedStylesheet.rel = 'stylesheet';
sharedStylesheet.href = 'shared.css';

document.body.appendChild(sharedStylesheet);
