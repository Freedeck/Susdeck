const eventNames = require('./eventNames');
const config = require('../managers/settings');

module.exports = {
  name: 'Companion',
  id: 'fd.handlers.companion',
  exec: ({socket, io}) => {
    socket.on(eventNames.companion.new_key, (data) => {
      data = JSON.parse(data);
      name = Object.keys(data)[0];
      const key = data[name];
      const parsed = JSON.parse(JSON.stringify(
          `{"${name}": ${JSON.stringify(key)}}`,
      ));
      const settings = config.settings();
      settings.profiles[settings.profile].push(JSON.parse(parsed));
      config.save();
      io.emit(eventNames.reload);
    });

    socket.on(eventNames.companion.dup_profile, (data) => {
      const settings = config.settings();
      settings.profiles[data] = settings.profiles[settings.profile];
      config.save();
      io.emit(eventNames.reload);
    });

    socket.on(eventNames.companion.set_profile, (data) => {
      config.settings().profile = data;
      config.save();
      io.emit(eventNames.reload);
    });

    socket.on(eventNames.companion.add_profile, (data) => {
      const settings = config.settings();
      settings.profiles[data] = [];
      settings.profile = data;
      config.save();
      io.emit(eventNames.reload);
    });

    socket.on(eventNames.companion.del_key, (data) => {
      data = JSON.parse(data);
      data.item = JSON.parse(data.item);
      const settings = config.settings();
      settings.profiles[settings.profile].forEach((snd) => {
        if (!(data.name in snd)) return;
        if (snd[data.name].uuid !== data.item.uuid) return;
        delete snd[data.name];
        settings.profiles[settings.profile] =
        settings.profiles[settings.profile]
            .filter((d) => Object.keys(d).length !== 0);
      });
      config.save();
      io.emit(eventNames.reload);
    });

    socket.on(eventNames.companion.move_key, (data) => {
      data = JSON.parse(data);
      data.item = JSON.parse(data.item);
      const settings = config.settings();
      let flag = false;
      settings.profiles[settings.profile].forEach((snd) => {
        if (flag) return;
        if (!(data.name in snd)) return;
        if (snd[data.name].uuid !== data.item.uuid) return;
        // if there's already something there
        settings.profiles[settings.profile].forEach((d) => {
          const datn = Object.keys(d)[0];
          const dat = d[datn];
          if (dat.pos === data.newIndex) {
            dat.pos = data.oldIndex;
          }
        });
        snd[data.name].pos = data.newIndex;
        flag = true;
      });
      config.save();
      io.emit(eventNames.reload);
    });

    socket.on(eventNames.companion.edit_key, (data) => {
      data = JSON.parse(data);
      // new name is data.name
      // old name is data.oldName
      const settings = config.settings();
      let flag = false;

      settings.profiles[settings.profile].forEach((snd) => {
        if (!(data.oldName in snd)) return;
        if (snd[data.oldName].uuid !== data.interaction.uuid) return;
        snd[data.name] = snd[data.oldName];
        snd[data.name] = data.interaction;
        if (data.name === data.oldName) return;
        if (flag) return;
        delete snd[data.oldName];
        flag = true;
      });

      config.save();
      io.emit(eventNames.reload);
    });
  },
};
