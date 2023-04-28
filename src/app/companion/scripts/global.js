/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
document.getElementById('mySidenav').onmouseover = () => {
  const rootElem = document.querySelector(':root');
  rootElem.style.setProperty('--sd-rotationDegrees', Math.ceil(Math.random() * 15) + 'deg');
};

const pages = [
  {
    name: 'Home',
    page: 'index.html',
    icon: 'img/home.png'
  },
  {
    name: 'Themes',
    page: 'themes.html',
    icon: 'img/themes.png'
  },
  {
    name: 'Soundboard',
    page: 'soundboard.html',
    icon: 'img/sounds.png'
  },
  {
    name: 'Icon Editor',
    page: 'iconEditor.html',
    icon: 'img/icon.png'
  },
  {
    name: 'Settings',
    page: 'settings.html',
    icon: 'img/settings.png'
  },
  {
    name: 'Experiments',
    page: 'experiments.html',
    icon: 'img/experiments.png',
    experimental: true
  }
];

pages.forEach(page => {
  if (page.experimental && susdeckUniversal.load('experiments') !== 'true') return;
  const btn = document.createElement('a');
  btn.href = page.page;
  if (window.location.href.includes(page.page)) {
    document.title = 'Susdeck Companion - ' + page.name;
    btn.className = 'activePage';
  }
  const btnImg = document.createElement('img');
  btnImg.src = page.icon;
  btnImg.alt = page.page + ' Icon';
  btnImg.width = '32';
  btnImg.height = '32';
  btn.appendChild(btnImg);
  document.getElementById('mySidenav').appendChild(btn);
});

document.body.onload = () => {
  const susdeckLogo = document.createElement('img');
  susdeckLogo.src = '../assets/icons/companion.png';
  susdeckLogo.className = 'susdeck-logo';
  document.body.appendChild(susdeckLogo);
};

function addToHTMLlog (text) {
  const txt = document.createElement('p');
  txt.innerText = text;
  txt.id = text;
  document.getElementById('console').appendChild(txt);
}

function enableExperiments () {
  if (confirm('Are you sure you want to turn on Susdeck Experiments?')) {
    if (susdeckUniversal.load('experiments') === 'true') {
      if (!confirm('Experiments is already enabled, do you want to turn off Susdeck Experiments?')) return;
      susdeckUniversal.save('experiments', false);
      alert('Experiments disabled.');
      return;
    }
    susdeckUniversal.save('experiments', true);
    alert('Experiments enabled.');
  }
}

function importTheme () {
  theme = document.getElementById('theme-import').value;
  susdeckUniversal.save('custom_theme', theme);
  susdeckUniversal.socket.emit('c-send-theme', theme);
  susdeckUniversal.socket.emit('c-change');
}
