/* eslint-disable no-unused-vars */

/* eslint-disable no-undef */
const susdeckUniversal = {
  screensaverStatus: false,
  themes: {
    // Built-in themes.
    Default: [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { background: '45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%' },
      { 'modal-color': 'rgba(0, 179, 255, 1)' }
    ],
    Fun: [
      { 'icon-count': 3 },
      { 'template-columns': 'repeat(5,1fr)' },
      { 'background-size': '400% 100%' },
      { 'font-family': 'Poppins' },
      { background: '45deg, rgba(245, 75, 66, 1) 0%, rgba(245, 162, 29, 1) 33%, rgba(195, 245, 29, 1) 66%, rgba(0, 179, 255, 1) 100%' },
      { 'modal-color': 'rgba(245, 162, 29, 1)' }
    ],
    Dark: [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik' },
      { background: '45deg, rgba(59, 59, 59, 1) 0%, rgba(94, 94, 94, 1) 33%, rgba(59, 59, 59, 1) 66%, rgba(87, 87, 87, 1) 100%' },
      { 'modal-color': 'rgba(0,0,0, 0.75)' }
    ],
    Blue: [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { background: '45deg, rgba(0, 183, 255, 1) 0%, rgba(33, 192, 255, 1) 33%, rgba(0, 183, 255, 1) 66%, rgba(33, 192, 255, 1) 100%' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { 'modal-color': 'rgba(33, 192, 255, 1)' }
    ],
    'Catppuccin Mocha': [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik' },
      { background: '45deg, rgba(30, 30, 40, 1) 0%, rgba(49,50,68, 1) 33%, rgba(30, 30, 40, 1) 66%, rgba(49,50,68, 1) 100%' },
      { 'btn-background': 'rgba(180, 190, 254, 0.15)' },
      { 'modal-color': 'rgb(203, 166, 247)' }
    ],
    'Compact Default': [
      { 'icon-count': 11 },
      { 'template-columns': 'repeat(5,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { background: '45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%' },
      { 'modal-color': 'rgba(0, 179, 255, 1)' }
    ]
  },
  retrieveSession: function () {
    return atob(susdeckUniversal.load('session'));
  },
  createTempHWID: function () {
    return Math.floor(Math.random() * 6969696969699);
  },
  log: function (data) {
    console.log('[SU] ' + data);
  },
  save: function (name, value) {
    localStorage.setItem('_sd' + name, value);
  },
  load: function (name) {
    return localStorage.getItem('_sd' + name);
  },
  remove: function (name) {
    return localStorage.removeItem('_sd' + name);
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
    const exportedThemeStr = JSON.stringify('[' + exportedTheme.join(',') + ']');

    susdeckUniversal.save('custom_theme', exportedThemeStr);
    const expt = document.getElementById('theme-exported');

    expt.value = exportedThemeStr;
    expt.hidden = false;
    return exportedThemeStr;
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
  sendToast: (message) => {
    const s = document.createElement('div');
    s.id = 'snackbar';
    s.innerText = message;

    // Add the "show" class to DIV
    s.className = 'show';
    document.body.appendChild(s);
    // After 3 seconds, remove the show class from DIV
    setTimeout(function () {
      s.className = s.className.replace('show', '');
      s.remove();
    }, 3000);
  },
  isDevBranch: false,
  iconCount: 8,
  debugStat: 'Debug',
  root: document.querySelector(':root'),
  hasConnected: false
};

susdeckUniversal.socket.on('server_connected', () => {
  susdeckUniversal.hasConnected = true;
  if (!susdeckUniversal.hasConnected) { socket.emit('c-change-client'); }
});

susdeckUniversal.socket.on('server_shutdown', () => {
  window.location.replace('/assets/tools/offline.html');
});

susdeckUniversal.socket.on('server_notification', (message) => {
  susdeckUniversal.sendToast(message);
})

susdeckUniversal.socket.on('set-theme', (theme) => {
  susdeckUniversal.save('theme', theme);

  if (susdeckUniversal.load('custom_theme')) {
    const theme2 = susdeckUniversal.load('custom_theme');
    const parsed = JSON.parse(JSON.parse(theme2));
    susdeckUniversal.socket.emit('c-send-theme', theme2);
    parsed.forEach(property => {
      Object.keys(property).forEach(key => {
        susdeckUniversal.root.style.setProperty(`--sd-${key}`, property[key]);
        document.body.setAttribute(`data-sd-${key}`, property[key]);
        if (Object.keys(property)[0] === 'icon-count') {
          susdeckUniversal.iconCount = property[key];
          try {
            autosort(property[key]);
          } catch (err) {
            console.log('Autosort failed: is client companion?');
          }
        }
      });
    });
  } else {
    const userTheme = susdeckUniversal.themes[susdeckUniversal.load('theme')];

    userTheme.forEach(property => {
      Object.keys(property).forEach(key => {
        susdeckUniversal.root.style.setProperty(`--sd-${key}`, property[key]);
        document.body.setAttribute(`data-sd-${key}`, property[key]);
        if (Object.keys(property)[0] === 'icon-count') {
          susdeckUniversal.iconCount = property[key];
          try {
            autosort(property[key]);
          } catch (err) {
            console.log('Autosort failed: is client companion?');
          }
        }
      });
    });
  }
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

// because theming is cool
if (!susdeckUniversal.load('theme')) {
  susdeckUniversal.save('theme', 'Default');
}

susdeckUniversal.socket.on('custom_theme', themeData => {
  if (themeData === 'del') {
    susdeckUniversal.remove('custom_theme');
    return;
  }
  susdeckUniversal.save('custom_theme', themeData);
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
  }, 20);
};

function addToHTMLlog (text) {
  const txt = document.createElement('h2');
  txt.id = text;
  txt.innerText = text;
  document.getElementById('console').appendChild(txt);
}
