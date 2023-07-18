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

];

const sideNav = document.createElement('div');
sideNav.id = 'sidebar';
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
  sideNav.appendChild(btn);
});

document.body.appendChild(sideNav);

document.querySelector('#topbar > button').onclick = () => {
  window.close();
}

experiments.forEach(experiment => {
  if (!document.body.contains(document.querySelector('#experiments'))) return;
  document.querySelector('#exp-count').innerText = `${experiments.length} experiment${experiments.length > 1 ? 's' : ''} available`;
  const newDiv = document.createElement('div');
  newDiv.className = 'experiment';
  newDiv.innerHTML = `<p>${experiment.name}</p>${experiment.html}`;
  document.querySelector('#experiments').appendChild(newDiv);
});

function listAudioDevices () {
  if (document.title !== 'Freedeck: Companion - Soundboard') return;
  Susaudio._player.devicesList.forEach(device => {
    const option = document.createElement('option');
    option.value = device.name;
    option.innerText = device.name;
    option.setAttribute('data-sai-id', device.id);
    if (Susaudio._player.sinkId === device.id) option.selected = true;
    document.querySelector('#sai').appendChild(option);
  });
}

setTimeout(() => { listAudioDevices(); }, 15);

if (document.querySelector('#sai')) {
  document.querySelector('#sai').onchange = function (ev) {
    Susaudio.setSink(document.querySelector('#sai').options[document.querySelector('#sai').selectedIndex].getAttribute('data-sai-id'));
    universal.log('Susaudio', 'Changed sink');
  };
}

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
      alert('Experiments disabled.');
      // Clear the user's custom theme
      universal.remove('custom_theme');
      universal.socket.emit('c-del-theme', '');
      universal.log('Experiments', 'Removed theme, requesting refresh');
      universal.socket.emit('c-change');
      return;
    }
    universal.save('experiments', true);

    alert('Experiments enabled.');
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
