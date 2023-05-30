/* eslint-disable no-unused-vars */

/* eslint-disable no-undef */
const universal = {
  screensaverStatus: false,
  themes: {
    // Built-in themes.
    Default: [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik, sans-serif' },
      { background: '45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%' },
      { 'modal-color': 'rgba(0, 179, 255, 1)' }
    ],
    Fun: [
      { 'icon-count': 3 },
      { 'template-columns': 'repeat(5,1fr)' },
      { 'background-size': '400% 100%' },
      { 'font-family': 'Comic Sans MS, Poppins' },
      { background: '45deg, rgba(245, 75, 66, 1) 0%, rgba(245, 162, 29, 1) 33%, rgba(195, 245, 29, 1) 66%, rgba(0, 179, 255, 1) 100%' },
      { 'modal-color': 'rgba(245, 162, 29, 1)' }
    ],
    Dark: [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik, sans-serif' },
      { background: '45deg, rgba(59, 59, 59, 1) 0%, rgba(94, 94, 94, 1) 33%, rgba(59, 59, 59, 1) 66%, rgba(87, 87, 87, 1) 100%' },
      { 'modal-color': 'rgba(0,0,0, 0.75)' }
    ],
    Blue: [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { background: '45deg, rgba(0, 183, 255, 1) 0%, rgba(33, 192, 255, 1) 33%, rgba(0, 183, 255, 1) 66%, rgba(33, 192, 255, 1) 100%' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Roboto, sans-serif' },
      { 'modal-color': 'rgba(33, 192, 255, 1)' }
    ],
    'Catppuccin Mocha': [
      { 'icon-count': 8 },
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik, sans-serif' },
      { background: '45deg, rgba(30, 30, 40, 1) 0%, rgba(49,50,68, 1) 33%, rgba(30, 30, 40, 1) 66%, rgba(49,50,68, 1) 100%' },
      { 'btn-background': 'rgba(180, 190, 254, 0.15)' },
      { 'modal-color': 'rgb(203, 166, 247)' }
    ],
    'Compact Default': [
      { 'icon-count': 11 },
      { 'template-columns': 'repeat(5,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik, sans-serif' },
      { background: '45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%' },
      { 'modal-color': 'rgba(0, 179, 255, 1)' }
    ],
    Yellow: [
      { 'icon-count': 11 },
      { 'template-columns': 'repeat(5,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik, sans-serif' },
      { background: '45deg, rgba(255, 215, 59, 1) 0%, rgba(209, 173, 33, 1) 33%, rgba(255, 215, 59, 1) 66%, rgba(209, 173, 33, 1) 100%' },
      { 'modal-color': 'rgba(255, 190, 106, 1)' }
    ]
  },
  retrieveSession: () => {
    return atob(universal.load('session'));
  },
  createTempHWID: () => {
    return Math.floor(Math.random() * 6969696969699);
  },
  log: function (sender, data) {
    universal.socket.emit('c2s_log', `[Companion/${sender}] ${data}`);
  },
  save: function (name, value) {
    localStorage.setItem('_sd_' + name, value);
  },
  load: function (name) {
    return localStorage.getItem('_sd_' + name);
  },
  remove: function (name) {
    return localStorage.removeItem('_sd_' + name);
  },
  socket: io(),
  emit: (event, data) => {
    if (typeof data === 'object') data = JSON.stringify(data);
    universal.socket.emit(event, data);
  },
  connectionOn: function (event, callback) {
    universal.socket.on(event, callback);
  },
  setTheme: (t) => {
    universal.save('theme', t);
    universal.socket.emit('c-theme', t);
    universal.socket.emit('c-change');
  },
  exportTheme: () => {
    // Get the theme and export back its root changeable properties
    // This will make importing themes so much easier
    const currentTheme = universal.load('theme');
    const sUTheme = universal.themes[currentTheme];
    const exportedTheme = [];
    Object.keys(sUTheme).forEach(key => {
      exportedTheme.push(JSON.stringify(sUTheme[key]));
    });
    const exportedThemeStr = JSON.stringify('[' + exportedTheme.join(',') + ']');

    universal.save('custom_theme', exportedThemeStr);
    const expt = document.getElementById('theme-exported');

    expt.value = exportedThemeStr;
    expt.hidden = false;
    return exportedThemeStr;
  },
  importTheme: function (themeJSONData) {
    const themeData = JSON.parse(themeJSONData);
    const themeName = themeData.name;
    const themeRules = themeData.data;

    universal.themes[themeName] = themeRules;
  },
  grantExperiments: () => {
    universal.save('experiments', true);
    universal.socket.emit('c-client-reload');
  },
  isInDebug: false,
  isExperimental: () => {
    return universal.load('experiments') ? universal.load('experiments') : 'false';
  },
  sendToast: (message) => {
    const s = document.createElement('div');
    s.id = 'snackbar';
    s.innerText = message;

    // Add the "show" class to DIV
    s.className = 'show';
    document.body.appendChild(s);

    setTimeout(() => { // After 3 seconds, remove the show class from DIV
      s.className = s.className.replace('show', '');
      s.remove();
    }, 3000);
  },
  validSession: () => {
    document.title = universal.load('owner_name') + '\'s Freedeck';
  },
  isDevBranch: false,
  iconCount: 8,
  debugStat: 'Debug',
  root: document.querySelector(':root'),
  hasConnected: false
};

universal.socket.on('server_connected', () => {
  universal.hasConnected = true;
  if (!universal.hasConnected) { socket.emit('c-change-client'); }
});

universal.socket.on('server_shutdown', () => {
  window.location.replace('/assets/tools/offline.html');
});

universal.socket.on('c-reset', () => {
  universal.remove('welcomed');
  universal.remove('custom_theme');
  window.location.replace(window.location.href);
});

universal.socket.on('server_notification', (message) => {
  universal.sendToast(message);
});

universal.socket.on('set-theme', (theme) => {
  universal.save('theme', theme);

  if (universal.load('custom_theme')) {
    const theme2 = universal.load('custom_theme');
    const parsed = JSON.parse(JSON.parse(theme2));
    universal.socket.emit('c-send-theme', theme2);
    parsed.forEach(property => {
      Object.keys(property).forEach(key => {
        universal.root.style.setProperty(`--sd-${key}`, property[key]);
        document.body.setAttribute(`data-sd-${key}`, property[key]);
        if (Object.keys(property)[0] === 'icon-count') {
          universal.iconCount = property[key];
          try {
            autosort(property[key]);
          } catch (err) {
          }
        }
      });
    });
  } else {
    const userTheme = universal.themes[universal.load('theme')];

    userTheme.forEach(property => {
      Object.keys(property).forEach(key => {
        universal.root.style.setProperty(`--sd-${key}`, property[key]);
        document.body.setAttribute(`data-sd-${key}`, property[key]);
        if (Object.keys(property)[0] === 'icon-count') {
          universal.iconCount = property[key];
          try {
            autosort(property[key]);
          } catch (err) {
            universal.log('Autosorter', 'Failed: is client companion?');
          }
        }
      });
    });
  }
});

universal.socket.on('s2ca_incorrect_pass', () => {
  universal.sendToast('Incorrect password!');
});

universal.socket.on('session_valid', () => {
  loaded = true; // Keep page from reloading
  document.getElementById('loading').style.display = 'none';
});

universal.socket.on('session_invalid', () => { // The server has restarted, and your session is invalid
  localStorage.setItem('_sdsession', '');
  if (document.body.contains(document.getElementById('keys'))) document.getElementById('keys').remove();
  document.getElementById('loading').style.display = 'block';
  document.getElementById('loading').innerHTML = `<h1>Freedeck</h1>
  Please wait a moment..
  <div id='console'></div>`;
  universal.save('temp_hwid', universal.createTempHWID()); // Create a temporary session ID for logging in
  universal.socket.emit('c2sr_login', universal.load('temp_hwid')); // Request login form with session ID
});

universal.socket.on('c-change', () => {
  window.location.replace(window.location.href);
});

fetch('/api/dbg')
  .then(data =>
    data.json())
  .then(data => {
    universal.isInDebug = data.status;
    universal.debugStat = data.msg;
  });

// because theming is cool
if (!universal.load('theme')) {
  universal.save('theme', 'Default');
}

universal.socket.on('custom_theme', themeData => {
  if (themeData === 'del') {
    universal.remove('custom_theme');
    return;
  }
  universal.save('custom_theme', themeData);
});

if (typeof ScreenSaverActivationTime === 'number' && document.getElementById('keys')) {
  setInterval(() => { userAlive = false; }, ScreenSaverActivationTime * 1000); // After x seconds the user is not alive :sob:
  // For example, 1 sec

  setInterval(() => {
    if (!userAlive && !universal.screensaverStatus) {
      document.getElementById('keys').style.opacity = '0.125';
    }
  }, ScreenSaverActivationTime * 1000 + 600); // For x.6 seconds, lower this
  // At 1.6 seconds of inactivity

  setInterval(() => {
    if (!userAlive) {
      document.getElementById('keys').style.opacity = '0';
      screensaverStatus = true;
    }
  }, ScreenSaverActivationTime * 1000 + 2 * 1000); // After x+1.2 seconds of inactivity, bye
  // At 2.2 seconds of inactivity (when 2.2 robert)
}

document.body.onload = () => {
  const footer = document.createElement('footer');
  footer.style.display = 'none';
  footer.style.zIndex = '999';
  document.body.appendChild(footer);
  if (!universal.isInDebug) return;
  footer.innerHTML = '<h3>In ' + universal.debugStat + ' Mode</h3>';
  footer.style.display = 'block';
};

function addToHTMLlog (text) {
  const txt = document.createElement('h2');
  txt.id = text;
  txt.innerText = text;
  document.getElementById('console').appendChild(txt);
}
