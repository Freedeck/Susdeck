const universal = {
    _socket: io(),
    _information: {},
    _init: false,
    page: 0,
    events: {},
    config: {},
    keys: document.querySelector('#keys') ? document.querySelector('#keys') : document.createElement('div'),
    save: (k, v) => {
        return localStorage.setItem(btoa('fd.' +k), btoa(v));
    },
    load: (k)=> {
        return atob(localStorage.getItem(btoa('fd.' + k)));
    },
    loadObj: (k) => {
        return JSON.parse(atob(localStorage.getItem(btoa('fd.' + k))));
    },
    init: async function (/** @type {string} */ user) {
        return new Promise((resolve, reject) => {
            universal.send('fd.greetings', user)
            universal.on('fd.info', (data) => {
                universal._information = JSON.parse(data);
                universal.events = JSON.parse(data).events;
                universal.config = JSON.parse(data).cfg;
                universal._init = true;
                resolve(true);
            })
        })
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