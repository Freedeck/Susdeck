/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const pages = [
  {
    name: 'Home',
    page: 'index.html',
    icon: 'img/home.svg'
  },
  {
    name: 'Icons',
    page: 'iconEditor.html',
    icon: 'img/icon.svg'
  }
];

Susaudio.init();

const sidenav = document.createElement('div');
sidenav.id = 'sidebar';
const tooltip = document.createElement('p');
tooltip.id = 'icon-tip';
document.body.appendChild(tooltip);

document.body.onload = () => {
  const freedeckLogo = document.createElement('img');
  freedeckLogo.src = '../assets/icons/companion.png';
  freedeckLogo.className = 'freedeck-logo';
  sidenav.appendChild(freedeckLogo);
};

pages.forEach(page => {
  const btn = document.createElement('a');
  btn.href = page.page;
  const btnImg = document.createElement('img');
  btnImg.src = page.icon;
  btnImg.alt = page.page + ' Icon';
  btnImg.width = '32';
  btnImg.height = '32';
  btn.onmouseenter = (ev) => {
    tooltip.innerText = page.name;
    tooltip.style.animationName = 'go-up';
  };
  btn.onmouseleave = (ev) => {
    tooltip.innerText = '';
    tooltip.style.animationName = '';
  };
  btn.appendChild(btnImg);
  sidenav.appendChild(btn);
});

document.body.appendChild(sidenav);

document.querySelector('#topbar > button').onclick = () => {
  window.close();
};

if(universal.load('experiments')) {
  universal.remove('experiments');
  universal.remove('experiments_list');
}

universal.socket.on('server_connected', (loginStatus) => {
  if (!loginStatus) {
    universal.socket.emit('Authenticated', String(universal.createTempHWID()) + 'cm');
  } else {
    if (universal.load('session')) { // If _sdsession exists login
      universal.socket.emit('Authenticated', universal.load('session'));
    } else {
      universal.sendToast('Not logged in, requesting login');
      universal.save('temp_hwid', universal.createTempHWID() + 'cm'); // Create a temporary session ID for logging in
      universal.socket.emit('c2sr_login', universal.load('temp_hwid')); // Request login form with session ID
    }
  }
});

universal.socket.on('session_valid', () => {
  universal.validSession();
});

universal.socket.on('s2ca_login', (nextLoc, loginMsg, ownerName) => { // When we get the green light to login
  loaded = true; // Keep page from reloading
  universal.sendToast('Request received by server, let\'s log in.');
  universal.save('login_msg', loginMsg);
  universal.save('owner_name', ownerName); // Save the login message and owner's name
  window.location.href = nextLoc; // Next, move the page over to login page that server sends back
});

const importTheme = () => {
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
};

const removeTheme = () => {
  theme = document.querySelector('#theme-import').value;
  universal.remove('custom_theme');
  universal.socket.emit('c-del-theme', theme);
  universal.socket.emit('c-change');
};

if (document.body.dataset.page) {
  document.title = 'Freedeck: Companion - ' + document.body.dataset.page;
}

document.querySelector('#sidebar').onmouseover = () => {
  const rootElem = document.querySelector(':root');
  rootElem.style.setProperty('--sd-rotation-degrees', Math.ceil(Math.random() * 15) + 'deg');
};

const sharedStylesheet = document.createElement('link');
sharedStylesheet.rel = 'stylesheet';
sharedStylesheet.href = 'shared.css';

document.body.appendChild(sharedStylesheet);
