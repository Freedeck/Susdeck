const eventNames = require('./eventNames');
const config = require('../loaders/settingsCache');

module.exports = {
    name: 'Companion',
    id: 'fd.handlers.companion',
    exec: ({socket}) => {
        socket.on(eventNames.companion.new_key, (data) => {
            data = JSON.parse(data);
            name = Object.keys(data)[0];
            let key = data[name];
            let parsed = JSON.parse(JSON.stringify(`{"${name}": ${JSON.stringify(key)}}`))
            config.settings().sounds.push(JSON.parse(parsed));
            config.save();
            return true;
        })
    }
}
