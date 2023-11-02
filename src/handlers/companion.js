const eventNames = require('./eventNames');
const config = require('../managers/settings');

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
        })

        socket.on(eventNames.companion.del_key, (data) => {
           //eventNames
          console.log('delkey')
          console.log(data)
        })

        socket.on(eventNames.companion.move_key, (data) => {
            data = JSON.parse(data);
            data.item = JSON.parse(data.item);
            config.settings().sounds.forEach(snd => {
                if (!(data.name in snd)) return;
                if (snd[data.name].uuid !== data.item.uuid) return;
                snd[data.name].pos = data.newIndex;
            })
            config.save();
        })

        const arrayMove = (arr, oldIndex, newIndex) => {
            if (newIndex >= arr.length) {
                let k = newIndex - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
            return arr; // for testing
        };
    }
}
