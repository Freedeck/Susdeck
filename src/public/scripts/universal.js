const universal = {
    _socket: io(),
    _information: {},
    _init: false,
    _authStatus: false,
    _serverRequiresAuth: true,
    page: 0,
    events: {},
    config: {},
    _loginAllowed: false,
    keys: document.querySelector('#keys') ? document.querySelector('#keys') : document.createElement('div'),
    notibar: document.querySelector('#snackbar') ? document.querySelector('#snackbar') : document.createElement('div'),
    save: (k, v) => {
        return localStorage.setItem(btoa('fd.' +k), btoa(v));
    },
    load: (k)=> {
        return atob(localStorage.getItem(btoa('fd.' + k)));
    },
    loadObj: (k) => {
        return JSON.parse(atob(localStorage.getItem(btoa('fd.' + k))));
    },
    updatePlaying: () => {
        if (document.querySelector('.now-playing')) {
            let fixed = [];
            universal.audioClient._nowPlaying.forEach(itm => {
                console.log(itm)
            })
            document.querySelector('.now-playing').innerText = fixed;
        }
    },
    audioClient: {
        _nowPlaying: [],
        _end: (event) => {
            universal.audioClient._nowPlaying.splice(universal.audioClient._nowPlaying.indexOf(event.target), 1);
            universal.updatePlaying();
        },
        _player: {
            sink: 0,
        },
        stopAll: () => universal.audioClient._nowPlaying.forEach(audio => audio.stop()),
        play: async (file, name) => {
            const audioInstance = new Audio(file);
            if (universal.audioClient._player.sink !== 0)  audioInstance.setSinkId(universal.audioClient._player.sink);
            audioInstance.setAttribute('data-name', name);
            await audioInstance.play();

            audioInstance.onended = (ev) => {universal.audioClient._end(ev)};

            universal.audioClient._nowPlaying.push(audioInstance);
            universal.updatePlaying();
        }
    },
    init: async function (user) {
        try {
            await universal._initFn(user);
        } catch (e) {
            console.error(e + ' | Universal: initialize failed.');
        }
    },
    _initFn: async function (/** @type {string} */ user) {
        return new Promise((resolve, reject) => {
            universal.send('fd.greetings', user)
            universal.on('fd.info', (data) => {
                const parsed = JSON.parse(data);
                universal._information = JSON.parse(data);
                universal._pluginData = {};
                universal.events = parsed.events;
                universal.config = parsed.cfg;
                universal.plugins = parsed.plugins;
                universal._serverRequiresAuth = universal.config.useAuthentication;
                universal._init = true;

                universal.save('tempLoginID', parsed.tempLoginID);

                universal.on(universal.events.not_trusted, () => universal.sendToast('Not trusted to do this action.'))

                universal.on(universal.events.not_auth, () => universal.sendToast('You are not authenticated!'))

                universal.on(universal.events.not_match, () => universal.sendToast('Login not allowed!'))

                universal.on(universal.events.keypress, (interactionData) => {
                    const interaction = JSON.parse(interactionData).sound;
                    if (user !== 'Companion') return;
                    if (interaction.type !== 'fd.sound') return;
                    if (interaction.name === 'Stop All') { universal.audioClient.stopAll(); return; }
                    universal.audioClient.play(interaction.data.path + '/' + interaction.data.file, interactionData.name);
                })

                universal.on(universal.events.log, (data) => {
                    data = JSON.parse(data);
                    console.log(data.sender + ': ' + data.data);
                })

                universal.on(universal.events.notif, (data) => universal.sendToast(data))

                universal.on(universal.events.plugin_info, (data) => {
                    universal._pluginData[JSON.parse(data).requested] = JSON.parse(data).response;
                })

                universal.on(universal.events.login_data_ack, (data) => universal._loginAllowed = data);

                universal.on(universal.events.login, (auth) => universal.authStatus = auth);

                universal.keys.id = 'keys';
                if (!document.querySelector('#keys')) document.body.appendChild(universal.keys);

                universal.notibar.id = 'snackbar';
                if (!document.querySelector('#snackbar')) document.body.appendChild(universal.notibar);

                resolve(true);
            })
        })
    },
    sendToast: (message) => {
        const s = document.createElement('div');
        s.id = 'toast';
        s.innerText = message;
        s.className = 'show';
        s.onclick = () => { s.className = s.className.replace('show', ''); s.remove(); };
        document.querySelector('#snackbar').appendChild(s);

        setTimeout(() => { // After 3 seconds, remove the show class from DIV
            s.className = s.className.replace('show', '');
            s.remove();
        }, 1250);
        universal.save('notification_log', universal.load('notification_log') + `,${btoa(JSON.stringify({ timestamp: new Date(), time: new Date().toTimeString(), page: window.location.pathname, message }))}`);
    },
    send: (event, value) => {
        universal._socket.emit(event, value);
    },
    on: (event, callback) => {
        universal._socket.on(event, callback);
    }
};

export { universal };
window['universal'] = universal;