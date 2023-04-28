/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const susdeckUniversal = {
  screensaverStatus: false,
  themes: {
    // Built-in themes.
    Default: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { background: '45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%' }
    ],
    Fun: [
      { 'template-columns': 'repeat(5,1fr)' },
      { 'background-size': '400% 100%' },
      { 'font-family': 'Poppins' },
      { background: '45deg, rgba(245, 75, 66, 1) 0%, rgba(245, 162, 29, 1) 33%, rgba(195, 245, 29, 1) 66%, rgba(0, 179, 255, 1) 100%' }
    ],
    Dark: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik' },
      { background: '45deg, rgba(59, 59, 59, 1) 0%, rgba(94, 94, 94, 1) 33%, rgba(59, 59, 59, 1) 66%, rgba(87, 87, 87, 1) 100%' }
    ],
    Blue: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { background: '45deg, rgba(0, 183, 255, 1) 0%, rgba(33, 192, 255, 1) 33%, rgba(0, 183, 255, 1) 66%, rgba(33, 192, 255, 1) 100%' }
    ],
    'Compact Default': [
      { 'template-columns': 'repeat(5,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { background: '45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%' }
    ]
  },
  retrieveSession: function () {
    return atob(susdeckUniversal.load('session'));
  },
  createTempHWID: function () {
    return Math.floor(Math.random() * 6969696969699);
  },
  save: function (name, value) {
    localStorage.setItem('_sd' + name, value);
  },
  load: function (name) {
    return localStorage.getItem('_sd' + name);
  },
  socket: io(),
  emit: (event, data) => {
    if (typeof data === 'object') data = JSON.stringify(data);
    susdeckUniversal.socket.emit(event, data);
  },
  connectionOn: function (event, callback) {
    susdeckUniversal.socket.on(event, callback);
  },
  exportTheme: function () {
    // Get the theme and export back its root changeable properties
    // This will make importing themes so much easier
    const currentTheme = susdeckUniversal.load('theme');
    const sUTheme = susdeckUniversal.themes[currentTheme];
    const exportedTheme = [];
    Object.keys(sUTheme).forEach(key => {
      exportedTheme.push(JSON.stringify(sUTheme[key]));
    });
    return JSON.stringify('{name:"' + currentTheme + '",data:[' + exportedTheme.join(',') + ']}');
  },
  importTheme: function (themeJSONData) {
    const themeData = JSON.parse(themeJSONData);
    const themeName = themeData.name;
    const themeRules = themeData.data;

    susdeckUniversal.themes[themeName] = themeRules;
  },
  grantExperiments: function () {
    susdeckUniversal.save('experiments', true);
    susdeckUniversal.socket.emit('c-client-reload');
  },
  isInDebug: false,
  isExperimental: () => {
    return susdeckUniversal.load('experiments') ? susdeckUniversal.load('experiments') : 'false';
  },
  isDevBranch: false,
  debugStat: 'Debug',
  hasConnected: false
};

susdeckUniversal.socket.on('server_connected', () => {
  susdeckUniversal.hasConnected = true;
  if (!susdeckUniversal.hasConnected) { socket.emit('c-change-client'); }
});

susdeckUniversal.socket.on('set-theme', (theme) => {
  susdeckUniversal.save('theme', theme);
  const userTheme = susdeckUniversal.themes[susdeckUniversal.load('theme')];

  userTheme.forEach(property => {
    Object.keys(property).forEach(key => {
      rootElem.style.setProperty(`--sd-${key}`, property[key]);
    });
  });
});

susdeckUniversal.socket.on('c-change', () => {
  window.location.replace(window.location.href);
});

fetch('/api/dbg')
  .then(data =>
    data.json())
  .then(data => {
    susdeckUniversal.isInDebug = data.status;
    susdeckUniversal.debugStat = data.msg;
  });

const rootElem = document.querySelector(':root');

// because theming is cool
if (!susdeckUniversal.load('theme')) {
  susdeckUniversal.save('theme', 'Default');
}

// Setup the user's theme
const userTheme = susdeckUniversal.themes[susdeckUniversal.load('theme')];

userTheme.forEach(property => {
  Object.keys(property).forEach(key => {
    rootElem.style.setProperty(`--sd-${key}`, property[key]);
  });
});

if (typeof ScreenSaverActivationTime === 'number' && document.getElementById('keys')) {
  setInterval(function () { userAlive = false; }, ScreenSaverActivationTime * 1000);

  setInterval(function () {
    if (!userAlive && !susdeckUniversal.screensaverStatus) {
      keys.style.opacity = '0.125';
    }
  }, ScreenSaverActivationTime * 1000 + 600);

  setInterval(function () {
    if (!userAlive) {
      keys.style.opacity = '0';
      screensaverStatus = true;
    }
  }, ScreenSaverActivationTime * 1000 + 2 * 1000);
}

document.body.onload = () => {
  const footer = document.createElement('footer');
  footer.style.display = 'none';
  footer.style.zIndex = '999';
  document.body.appendChild(footer);
  setTimeout(() => {
    if (!susdeckUniversal.isInDebug) return;
    footer.innerHTML = '<h3>In ' + susdeckUniversal.debugStat + ' Mode</h3>';
    footer.style.display = 'block';
  }, 12);
};

function addToHTMLlog (text) {
  const txt = document.createElement('h2');
  txt.id = text;
  txt.innerText = text;
  document.getElementById('console').appendChild(txt);
}
