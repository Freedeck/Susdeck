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
  loadObj: (k) => {
    return JSON.parse(atob(localStorage.getItem(btoa('fd.' + k))));
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
      const audioInstance = new Audio(file);
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
      if (stopPrevious == true) {
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
    console.log('logging in');
    universal.send(universal.events.login_data, {
      tlid: universal._information.tempLoginID,
    });
    universal.send(universal.events.login, {passwd});
  },
  init: async function(user) {
    try {
      await universal._initFn(user);
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
  /*  */
  _cb: [],
  keySet: () => {
    for (let i = 0; i < universal.config.iconCountPerPage; i++) {
      const tempDiv = document.createElement('div');
      tempDiv.className = 'button k-' + i + ' unset k';
      universal.keys.appendChild(tempDiv);
    }
    const builtInKeys = [
      {
        name: 'Stop All',
        onclick: (ev) => {
          universal.send(
              universal.events.keypress,
              JSON.stringify({builtIn: true, data: 'stop-all'}),
          );
        },
      },
      {
        name: 'Reload',
        onclick: (ev) => {
          window.location.reload();
        },
      },
      {
        name: 'Settings',
        onclick: (ev) => {
          console.log('To be implemented...');
        },
      },
    ];

    builtInKeys.forEach((key) => {
      const tempDiv = document.createElement('div');
      tempDiv.className = 'button unset builtin k';
      tempDiv.innerText = key.name;
      tempDiv.onclick = key.onclick;
      universal.keys.appendChild(tempDiv);
    });
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
  channels: {
    send: (plugin, channel, data) => {
      universal.send(universal.events.channel_send, {plugin, channel, data});
    },
    listen: (plugin, channel, callback) => {
      universal.on('channel_' + plugin + '_' + channel, (data) => {
        callback(data);
      });
    },
  },
  listenFor: (ev, cb) => {
    universal._cb.push([ev, cb]);
  },
  sendEvent: (ev, ...data) => {
    universal._cb.forEach((cb) => {
      if (cb[0] === ev) cb[1](...data);
    });
  },
  _initFn: async function(/** @type {string} */ user) {
    return new Promise((resolve, reject) => {
      try {
        universal.send('fd.greetings', user);
        universal.send('fd.greetings', user);
        universal.send('fd.greetings', user);
        universal.once('fd.info', (data) => {
          const parsed = JSON.parse(data);
          universal._information = JSON.parse(data);
          universal._pluginData = {};
          universal.events = parsed.events;
          universal.config = parsed.cfg;
          universal.config.sounds = parsed.cfg.profiles[parsed.cfg.profile];
          universal.plugins = parsed.plugins;
          universal._serverRequiresAuth = universal.config.useAuthentication;
          universal._init = true;

          if (!universal.load('welcomed')) {
            universal.sendToast('Welcome to Freedeck.');
            universal.save('welcomed', 'true');
          }

          universal.save('tempLoginID', parsed.tempLoginID);

          universal.on(universal.events.not_trusted, () =>
            universal.sendToast('Not trusted to do this action.'),
          );

          universal.on(universal.events.not_auth, () =>
            universal.sendToast('You are not authenticated!'),
          );

          universal.on(universal.events.not_match, () =>
            universal.sendToast(
                'Login not allowed! Session could not be verified against server.',
            ),
          );

          universal.on(universal.events.no_init_info, (data) => {
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
            if (!universal.load('stopPrevious')) {
              universal.save('stopPrevious', false);
            }
            universal.audioClient.play(
                interaction.data.path + '/' + interaction.data.file,
                Object.keys(a)[0],
                false,
                (universal.load('stopPrevious').toLowerCase() === 'true'),
            );
            universal.audioClient.play(
                interaction.data.path + '/' + interaction.data.file,
                Object.keys(a)[0],
                true,
                (universal.load('stopPrevious').toLowerCase() === 'true'),
            );
          });

          universal.on(universal.events.log, (data) => {
            data = JSON.parse(data);
            console.log(data.sender + ': ' + data.data);
          });

          universal.on(universal.events.notif, (data) => {
            data = JSON.parse(data);
            if (!data.isCon) {
              universal.sendToast('[' + data.sender + '] ' + data.data);
            }
            if (data.isCon) universal.sendEvent('notif', data);
          });

          universal.on(
              universal.events.login_data_ack,
              (data) => (universal._loginAllowed = data),
          );
          universal.on(universal.events.reload, () => window.location.reload());

          universal.on(universal.events.login, (auth) => {
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
    }, 1250);
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
    universal.send(universal.events.log, JSON.stringify({sender, data}));
    console.log(`[${sender}] ${data}`);
  },
};

// eslint-ignore no-unused-vars
export {universal};
window['universal'] = universal;
