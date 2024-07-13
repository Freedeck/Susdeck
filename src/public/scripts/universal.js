
/**
 * Open the settings menu (on clients only)
 */
function settingsMenu() {
  if (universal.name == 'Main') {
    document.querySelector('.settings-menu').style.display = 'flex';
  }
}

const universal = {
  _socket: io(),
  _information: {},
  _init: false,
  _authStatus: false,
  _tyc: new Map(),
  _serverRequiresAuth: true,
  page: 0,
  events: {},
  config: {},
  _loginAllowed: false,
  keys: document.querySelector('#keys') ?
    document.querySelector('#keys') :
    document.createElement('div'),
  notibar: document.querySelector('#snackbar') ?
    document.querySelector('#snackbar') :
    document.createElement('div'),
  save: (k, v) => {
    return localStorage.setItem(btoa('fd.' + k), btoa(v));
  },
  load: (k) => {
    return atob(localStorage.getItem(btoa('fd.' + k)));
  },
  exists: (k) => {
    return localStorage.getItem(btoa('fd.' + k)) ? true : false;
  },
  loadObj: (k) => {
    return JSON.parse(atob(localStorage.getItem(btoa('fd.' + k))));
  },
  default: (k, v) => {
    return universal.exists(k) ? universal.load(k) : universal.save(k, v);
  },
  storage: {
    keys: () => {
      const _keys = [];
      Object.keys(localStorage).forEach((key) => {
        key = atob(key);
        if (key.startsWith('fd.')) {
          _keys.push(key);
        }
      });
      return _keys;
    },
    reset: () => {
      Object.keys(localStorage).forEach((key) => {
        key = atob(key);
        if (key.startsWith('fd.')) {
          localStorage.removeItem(key);
        }
        location.reload();
      });
    },
  },
  showSpinner: (e = document.body) => {
    const elem = document.createElement('div');
    elem.className = 'spinner';
    e.appendChild(elem);
  },
  updatePlaying: () => {
    if (document.querySelector('.now-playing')) {
      const fixed = [];
      universal.audioClient._nowPlaying.forEach((itm) => {
        fixed.push(itm.getAttribute('data-name'));
      });
      document.querySelector('.now-playing').innerText = fixed;
    }
  },
  embedded_settings: {
    createSelect: async (label, name, optionsPromise, labelsPromise, selected, eventHandler=()=>{}) => {
      const container = document.createElement('div');
      container.className = 'es-setting';

      const select = document.createElement('select');
      select.id = name;

      const lbl = document.createElement('label');
      lbl.innerText = label;
      lbl.htmlFor = name;
      container.appendChild(lbl);
      container.appendChild(select);
      // Assuming optionsPromise is a Promise that resolves to an array of options
      const options = await optionsPromise;
      const labels = await labelsPromise;
      options.forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.innerText = labels[options.indexOf(option)];
        if (option == selected) opt.selected = true;
        select.appendChild(opt);
      });
      // select the first option if none are selected
      if (select.selectedIndex == -1) select.selectedIndex = 0;
      select.onchange = eventHandler;
      return container;
    },
  },
  audioClient: {
    _nowPlaying: [],
    _end: (event) => {
      universal.audioClient._nowPlaying.splice(
          universal.audioClient._nowPlaying.indexOf(event.target),
          1,
      );
      universal.updatePlaying();
    },
    _player: {
      sink: 0,
      monitorPotential: [],
      monitorSink: 'default',
      recsink: 0,
      normalVol: 1,
      monitorVol: 1,
      pitch: 1,
    },
    stopAll: () =>
      universal.audioClient._nowPlaying.forEach(async (audio) => {
        try {
          await audio.pause();
          audio.currentTime = audio.duration;
          await audio.play();
        } catch (err) {
          // "waah waah waah noo you cant just abuse audio api" -companion
          // > i dont care :trole:
        }
      }),
    setPitch: (pitch) => {
      universal.audioClient._player.pitch = pitch;
      universal.audioClient._nowPlaying.forEach((audio) => {
        audio.playbackRate = pitch;
      });
      universal.save('pitch', pitch);
      document.querySelector('#pitch').value = pitch;
    },
    setVolume: (vol) => {
      universal.audioClient._player.normalVol = vol;
      universal.audioClient._nowPlaying.forEach((audio) => {
        audio.volume = vol;
      });
      universal.save('vol', vol);
      document.querySelector('#v').value = vol;
    },
    play: async (file, name, isMonitor = false, stopPrevious = false) => {
      const audioInstance = new Audio();
      audioInstance.src = file;
      audioInstance.load();
      if (universal.audioClient._player.sink !== 0) {
        navigator.mediaDevices.getUserMedia({audio: true, video: false});
        await audioInstance.setSinkId(universal.audioClient._player.sink);
      }
      audioInstance.setAttribute('data-name', name);
      audioInstance.setAttribute('data-isMonitor', false);

      if (isMonitor) {
        navigator.mediaDevices.getUserMedia({audio: true, video: false});
        await audioInstance.setSinkId(
            universal.audioClient._player.monitorSink,
        );
        if (universal.load('monitor.sink')) {
          navigator.mediaDevices.getUserMedia({audio: true, video: false});
          await audioInstance.setSinkId(universal.load('monitor.sink'));
        }
        audioInstance.volume = universal.audioClient._player.monitorVol;
      } else {
        audioInstance.volume = universal.audioClient._player.normalVol;
      }
      if (universal.load('pitch')) {
        audioInstance.playbackRate = universal.load('pitch');
      }
      if (universal.load('vol')) {
        audioInstance.volume = universal.load('vol');
      }
      audioInstance.preservesPitch = false;
      audioInstance.fda = {};
      audioInstance.fda.name = name;
      audioInstance.fda.monitoring = isMonitor;
      if (stopPrevious == 'stop_prev') {
        universal.audioClient._nowPlaying.forEach(async (audio) => {
          try {
            if (audio.fda.name === audioInstance.fda.name) {
              await audio.pause();
              audio.currentTime = audio.duration;
              await audio.play();
            }
          } catch (err) {
            // "waah waah waah noo you cant just abuse audio api" -companion
            // > i dont care :trole:
          }
        });
      }
      await audioInstance.play();

      audioInstance.onended = (ev) => {
        universal.audioClient._end(ev);
      };

      universal.audioClient._nowPlaying.push(audioInstance);
      universal.updatePlaying();
      return audioInstance;
    },
  },
  login: (passwd) => {
    universal.send(universal.events.login.login_data, {
      tlid: universal._information.tempLoginID,
    });
    universal.send(universal.events.login.login, {passwd});
  },
  themeData: {},
  themes: {
    default: {
      'name': 'Default',
      'description': 'The default theme for Freedeck',
    },
    red: {
      'name': 'Red',
      'description': 'A red theme for Freedeck',
    },
    blue: {
      'name': 'Blue',
      'description': 'A blue theme for Freedeck',
    },
    green: {
      'name': 'Green',
      'description': 'A green theme for Freedeck',
    },
    yellow: {
      'name': 'Yellow',
      'description': 'A yellow theme for Freedeck',
    },
    gruggly: {
      'name': 'Gruggly',
      'description': 'A gruggly theme for Freedeck (pantone 448c)',
    },
    catppuccin_mocha: {
      'name': 'Catppuccin Mocha',
      'description': 'A soothing pastel theme for Freedeck',
    },
    dark: {
      'name': 'Dark',
      'description': 'A dark theme for Freedeck',
    },
    fun: {
      'name': 'Fun',
      'description': 'A fun theme for Freedeck',
    },
    bigger: {
      'name': 'Bigger Buttons',
      'description': 'The default theme with bigger buttons',
    },
    circular: {
      'name': 'Circular',
      'description': 'A circular theme for Freedeck',
    },
    big_black: {
      'name': 'Bigger Buttons (Black)',
      'description': 'The default theme with bigger buttons and a black (AMOLED-like) background',
    },
    black: {
      'name': 'Black',
      'description': 'A black (AMOLED-like) theme for Freedeck',
    },
  }, /* Theme list */
  setTheme: function(name, global = true) {
    let fu = name;
    fetch('/scripts/theming/' + name + '/manifest.json').then((res) => res.json()).then((json) => {
      fu = json.theme;
    });
    fetch('/scripts/theming/' + name + '/' + fu + '.css').then((res) => res.text()).then((css) => {
      const stylea = document.createElement('style');
      stylea.innerText += css;
      document.body.appendChild(stylea);
      universal.save('theme', name);
      const dStyle = getComputedStyle(document.body);
      universal.themeData = {
        name: dStyle.getPropertyValue('--theme-name'),
        author: dStyle.getPropertyValue('--theme-author'),
        description: dStyle.getPropertyValue('--theme-description'),
      };
      if (global) universal.send(universal.events.companion.set_theme, name);
      universal.save('theme', name);
    });
  },
  imported_scripts: [],
  import: (script) => {
    universal.imported_scripts.push(script);
    const scriptElement = document.createElement('script');
    scriptElement.src = script;
    scriptElement.id = script.split('/').pop().split('.').shift();
    document.body.appendChild(scriptElement);
  },
  init: async function(user) {
    try {
      if (!universal.imported_scripts.includes('https://cdn.jsdelivr.net/npm/pako@1.0.11/dist/pako.min.js')) {
        universal.import('https://cdn.jsdelivr.net/npm/pako@1.0.11/dist/pako.min.js');
      }
      await universal._initFn(user);
      universal.setTheme(universal.config.theme ? universal.config.theme : 'default', false);
      const devices = await navigator.mediaDevices.enumerateDevices();
      devices.forEach((device) => {
        if (device.kind == 'audiooutput') universal.audioClient._player.monitorPotential.push(device);
      });
      universal.load('vb.sink') ?
        (universal.audioClient._player.sink = universal.load('vb.sink')) :
        false;
      universal.load('monitor.sink') ?
        (universal.audioClient._player.monitorSink =
          universal.load('monitor.sink')) :
        'default';
    } catch (e) {
      console.error(e + ' | Universal: initialize failed.');
    }
  },
  /* repos */
  repositoryManager: {
    official: [
      {
        title: 'freedeck.app',
        who: 'Official Freedeck Repository',
        link: 'https://freedeck.app/_fd/repository.php',
      },
    ],
    unofficial: [],
    getPluginsfromRepo: async (url) => {
      const _plugins = [];
      const res = await fetch(url);
      const data = await res.text();
      if (res.status != 200) return [{err: true, msg: 'Repository not found. Server returned ' + res.status}];
      if (!data.includes(',!')) return [{err: true, msg: 'No plugin metadata found.'}];
      let lines = data.split('\n');
      lines.shift();
      lines = lines.filter((line) => line.length > 0);
      lines.forEach((line) => {
        const comma = line.split(',!');
        const meta = {
          file: url + '/' + comma[0],
          githubRepo: 'https://github.com/' + comma[1],
          name: comma[2],
          author: comma[3],
          version: comma[4],
          description: comma[5],
          id: comma[6],
        };
        _plugins.push(meta);
      });
      return _plugins;
    },
  },
  /*  */
  _cb: [],
  keySet: () => {
    for (let i = 0; i < universal.config.iconCountPerPage; i++) {
      const tempDiv = document.createElement('div');
      tempDiv.className = 'button k-' + i + ' unset k';
      universal.keys.appendChild(tempDiv);
    }
    const builtInKeys = [
      // {
      //   name: 'Stop All',
      //   onclick: (ev) => {
      //     universal.send(
      //       universal.events.keypress,
      //       JSON.stringify({ builtIn: true, data: 'stop-all' }),
      //     );
      //   },
      // },
      {
        name: 'Reload',
        onclick: (ev) => {
          window.location.reload();
        },
      },
      // {
      //   name: 'Settings',
      //   onclick: (ev) => {
      //     settingsMenu();
      //   },
      // },
    ];

    builtInKeys.forEach((key) => {
      const tempDiv = document.createElement('div');
      tempDiv.className = 'button builtin k';
      tempDiv.innerText = key.name;
      tempDiv.onclick = key.onclick;
      universal.keys.appendChild(tempDiv);
    });
  },
  connHelpWizard() {
    const promptEle = document.createElement('div');
    promptEle.className = 'prompt';
    const iframe = document.createElement('iframe');
    iframe.src = '/prompt-user-connect.html';
    iframe.frameBorder = '0';
    promptEle.appendChild(iframe);
    document.body.appendChild(promptEle);
  },
  Pages: {},
  reloadProfile: () => {
    universal.config.sounds =
      universal.config.profiles[universal.config.profile];
    for (
      let i = 0;
      i < universal.config.sounds.length / universal.config.iconCountPerPage;
      i++
    ) {
      universal.Pages[i] = true;
    }
  },
  listenFor: (ev, cb) => {
    universal._cb.push([ev, cb]);
  },
  sendEvent: (ev, ...data) => {
    universal._cb.forEach((cb) => {
      if (cb[0] === ev) cb[1](...data);
    });
  },
  name: '',
  _initFn: async function(/** @type {string} */ user) {
    return new Promise((resolve, reject) => {
      try {
        universal.name = user;
        universal.send('G', user);
        universal.send('G', user);
        universal.send('G', user);
        universal.once('I', async (data) => {
          /**
           * Decompresses a Gzip blob
           * @param {*} blob A Gzip-compressed blob
           * @param {*} callback A callback function
           */
          function decompressGzipBlob(blob, callback) {
            blob = new Uint8Array(blob);
            const data = pako.inflate(blob, {to: 'string'});
            callback(null, data);
          }
          /**
           * Async version of decompressGzipBlob
           * @param {*} blob Gzip-compressed blob
           * @return {Promise<string>} The decompressed data
           */
          function asyncDecompressGzipBlob(blob) {
            return new Promise((resolve, reject) => {
              decompressGzipBlob(blob, (err, data) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              });
            });
          }
          data = await asyncDecompressGzipBlob(data);
          const parsed = JSON.parse(data);
          universal._information = JSON.parse(data);
          universal._pluginData = {};
          universal.events = parsed.events;
          universal.config = parsed.cfg;
          universal.config.sounds = parsed.cfg.profiles[parsed.cfg.profile];
          universal.plugins = parsed.plugins;
          universal._serverRequiresAuth = universal.config.useAuthentication;
          universal._init = true;

          // default setup
          universal.default('notification_log', '');
          universal.default('playback-mode', 'play_over');
          universal.default('vol', 1);
          universal.default('pitch', 1);
          universal.default('monitor.sink', 'default');
          universal.default('vb.sink', 'default');
          universal.default('has_setup', false);
          universal.default('theme', 'default');
          universal.default('profile', 'Default');
          universal.default('repos.community', JSON.stringify([]));

          if (!universal.load('welcomed')) {
            universal.sendToast('Welcome to Freedeck.');
            universal.save('welcomed', 'true');
          }

          universal.save('tempLoginID', parsed.tempLoginID);

          universal.on(universal.events.default.not_trusted, () =>
            universal.sendToast('Not trusted to do this action.'),
          );

          universal.on(universal.events.default.not_auth, () =>
            universal.sendToast('You are not authenticated!'),
          );

          universal.on(universal.events.default.not_match, () =>
            universal.sendToast(
                'Login not allowed! Session could not be verified against server.',
            ),
          );

          universal.on(universal.events.default.no_init_info, (data) => {
            const parsedToo = JSON.parse(data);
            universal._information = JSON.parse(data);
            universal._pluginData = {};
            universal.events = parsedToo.events;
            universal.config = parsedToo.cfg;
            universal.plugins = parsedToo.plugins;
            universal._serverRequiresAuth = universal.config.useAuthentication;
            universal.sendEvent('new-info');
          });

          universal.on(universal.events.keypress, (interactionData) => {
            const interaction = JSON.parse(interactionData);
            if (!user.includes('Companion')) return;
            if ('sound' in interaction && interaction.sound.name === 'Stop All') {
              universal.audioClient.stopAll();
              return;
            }
            universal.sendEvent('button', interaction);
            if (interaction.type !== 'fd.sound') return;
            universal.reloadProfile();
            // get name from universal.config.sounds with uuid
            const a = universal.config.sounds.filter((snd) => {
              const k = Object.keys(snd)[0];
              return snd[k].uuid === interaction.uuid;
            })[0];
            if (!universal.load('playback-mode')) {
              universal.save('playback-mode', 'play_over');
            }
            universal.audioClient.play(
                interaction.data.path + '/' + interaction.data.file,
                Object.keys(a)[0],
                false,
                universal.load('stopPrevious'),
            );
            universal.audioClient.play(
                interaction.data.path + '/' + interaction.data.file,
                Object.keys(a)[0],
                true,
                universal.load('stopPrevious'),
            );
          });

          universal.on(universal.events.default.recompile, () => {
            window.location.href = '/fdconnect.html';
          });

          universal.on(universal.events.default.log, (data) => {
            data = JSON.parse(data);
            console.log(data.sender + ': ' + data.data);
          });

          universal.on(universal.events.default.notif, (data) => {
            data = JSON.parse(data);
            if (!data.isCon) {
              universal.sendToast('[' + data.sender + '] ' + data.data);
            }
            if (data.isCon) universal.sendEvent('notif', data);
          });

          universal.on(
              universal.events.login.login_data_ack,
              (data) => (universal._loginAllowed = data),
          );
          universal.on(universal.events.default.reload, () => window.location.reload());

          universal.on(universal.events.default.login, (auth) => {
            universal.authStatus = auth;
            if (auth === false) {
              universal.sendToast('Incorrect password!');
              if (document.querySelector('#login-dialog')) document.querySelector('#login-dialog').style.display = 'block';
            }
            universal.sendEvent('auth', auth);
          });

          universal.keys.id = 'keys';
          if (!document.querySelector('#keys')) {
            document.body.appendChild(universal.keys);
          }

          universal.notibar.id = 'snackbar';
          if (!document.querySelector('#snackbar')) {
            document.body.appendChild(universal.notibar);
          }

          universal.send(universal.events.information, {apiVersion: '2'});

          universal.keySet();

          universal.repositoryManager.unofficial = universal.loadObj('repos.community') || [];

          Object.keys(universal.plugins).forEach((plugin) => {
            const plug = universal.plugins[plugin];
            plug.types.forEach((type) => {
              universal._tyc.set(type, plug);
            });
          });

          window['universal'] = universal;
          universal.sendEvent('init');
          universal.sendEvent('loadHooks');
          resolve(true);
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  },
  sendToast: (message) => {
    if (!HTMLElement.prototype.setHTML) {
      HTMLElement.prototype.setHTML = function(html) {
        this.innerHTML = html;
      };
    }
    const s = document.createElement('div');
    s.id = 'toast';
    s.setHTML(message);
    s.className = 'show';
    s.onclick = () => {
      s.className = s.className.replace('show', '');
      s.remove();
    };
    document.querySelector('#snackbar').appendChild(s);

    setTimeout(() => {
      // After 3 seconds, remove the show class from DIV
      s.className = s.className.replace('show', '');
      s.remove();
    }, 3000);
    universal.save(
        'notification_log',
        universal.load('notification_log') +
      `,${btoa(
          JSON.stringify({
            timestamp: new Date(),
            time: new Date().toTimeString(),
            page: window.location.pathname,
            message,
          }),
      )}`,
    );
  },
  send: (event, value) => {
    universal._socket.emit(event, value);
  },
  on: (event, callback) => {
    universal._socket.on(event, callback);
  },
  once: (event, callback) => {
    universal._socket.once(event, callback);
  },
  log: (data, sender = 'Universal') => {
    universal.send(universal.events.default.log, JSON.stringify({sender, data}));
    console.log(`[${sender}] ${data}`);
  },
};

// eslint-ignore no-unused-vars
export {universal};
window['universal'] = universal;
