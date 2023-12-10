const eventNames = require('./eventNames');
const config = require('../managers/settings');

module.exports = {
    name: 'Companion',
    id: 'fd.handlers.companion',
    exec: ({socket, io}) => {
        socket.on(eventNames.companion.new_key, (data) => {
            data = JSON.parse(data);
            name = Object.keys(data)[0];
            let key = data[name];
            let parsed = JSON.parse(JSON.stringify(`{"${name}": ${JSON.stringify(key)}}`))
            let settings = config.settings();
            settings.profiles[settings.profile].push(JSON.parse(parsed));
            config.save();
            io.emit(eventNames.reload);
        })
        
        socket.on(eventNames.companion.set_profile, (data) => {
            config.settings().profile = data;
            config.save();
            io.emit(eventNames.reload);
        });

        socket.on(eventNames.companion.add_profile, (data) => {
            let settings = config.settings();
            settings.profiles[data] = [];
            settings.profile = data;
            config.save();
            io.emit(eventNames.reload);
        })

        socket.on(eventNames.companion.del_key, (data) => {
            data = JSON.parse(data);
            data.item = JSON.parse(data.item);
            let settings = config.settings();
            settings.profiles[settings.profile].forEach(snd => {
                if (!(data.name in snd)) return;
                if (snd[data.name].uuid !== data.item.uuid) return;
                delete snd[data.name];
                settings.profiles[settings.profile] = settings.profiles[settings.profile].filter(d => Object.keys(d).length !== 0);
            })
            config.save();
            io.emit(eventNames.reload);
        })

        socket.on(eventNames.companion.move_key, (data) => {
            data = JSON.parse(data);
            data.item = JSON.parse(data.item);
            let settings = config.settings();
            settings.profiles[settings.profile].forEach(snd => {
                if (!(data.name in snd)) return;
                if (snd[data.name].uuid !== data.item.uuid) return;
                // if there's already something there
                settings.profiles[settings.profile].forEach(d => {
                    let datn = Object.keys(d)[0];
                    let dat = d[datn]
                    if (dat.pos === data.newIndex) {
                        dat.pos = data.oldIndex;
                    }
                })
                snd[data.name].pos = data.newIndex;
            })
            config.save();
            io.emit(eventNames.reload);
        })

        socket.on(eventNames.companion.edit_key, (data) => {
            data = JSON.parse(data);
            // new name is data.name
            // old name is data.oldName
            let settings = config.settings();

            settings.profiles[settings.profile].forEach(snd => {
                if (!(data.oldName in snd)) return;
                if (snd[data.oldName].uuid !== data.interaction.uuid) return;
                snd[data.name] = snd[data.oldName];
                snd[data.name] = data.interaction;
                if (data.name === data.oldName) return;
                delete snd[data.oldName];
            })

            config.save();
            io.emit(eventNames.reload);
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
