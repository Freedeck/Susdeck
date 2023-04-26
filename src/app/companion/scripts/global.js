document.getElementById('mySidenav').onmouseover = () => {
  const rootElem = document.querySelector(':root');
  rootElem.style.setProperty('--sd-rotdeg', Math.ceil(Math.random() * 15) + 'deg');
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
  }
];

pages.forEach(page => {
  const btn = document.createElement('a');
  btn.href = page.page;
  if (window.location.href.includes(page.page)) {
    btn.className = 'snactive';
  }
  const btnImg = document.createElement('img');
  btnImg.src = page.icon;
  btnImg.alt = page.page + ' Icon';
  btnImg.width = '32';
  btnImg.height = '32';
  btn.appendChild(btnImg);
  document.getElementById('mySidenav').appendChild(btn);
});
