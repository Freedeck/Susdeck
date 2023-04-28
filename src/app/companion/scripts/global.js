/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
document.getElementById('mySidenav').onmouseover = () => {
  const rootElem = document.querySelector(':root');
  rootElem.style.setProperty('--sd-rotationDegrees', Math.ceil(Math.random() * 15) + 'deg');
};

const pages = [
  {
    page: 'index.html',
    icon: 'img/home.png'
  },
  {
    page: 'themes.html',
    icon: 'img/themes.png'
  },
  {
    page: 'soundboard.html',
    icon: 'img/sounds.png'
  },
  {
    page: 'iconEditor.html',
    icon: 'img/icon.png'
  },
  {
    page: 'settings.html',
    icon: 'img/settings.png'
  },
  {
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

function addToHTMLlog (text) {
  const txt = document.createElement('p');
  txt.innerText = text;
  txt.id = text;
  document.getElementById('console').appendChild(txt);
}

function enableExperiments () {
  if (confirm('Are you sure you want to turn on Susdeck Experiments?')) { susdeckUniversal.save('experiments', true); alert('Experiments enabled.'); }
}
