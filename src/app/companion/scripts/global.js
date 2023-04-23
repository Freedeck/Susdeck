document.getElementById('mySidenav').onmouseover = () => {
  const rootElem = document.querySelector(':root');
  rootElem.style.setProperty('--sd-rotdeg', Math.ceil(Math.random() * 15) + 'deg');
};
