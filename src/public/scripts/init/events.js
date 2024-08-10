export default function eventsHandler(universal, user) {
  return new Promise((resolve, reject) => {
    universal.CLU('Bootd', 'Creating event handlers...');
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
      window.location.href = '/fdconnect.html?id=' + user;
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

    universal._socket.on('disconnect', () => {
      universal.connected = false;
      universal.sendToast('Disconnected from server.');
      universal.lastRetry = new Date();
      const retryLoop = setInterval(() => {
        universal.sendToast('Attempting to reconnect...');
        universal.reconnect();
        setTimeout(() => {
          if (universal.connected === true) {
            clearInterval(retryLoop);
          }
        }, 1500);
      }, 2000);
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
      } else {
      }
      universal.sendEvent('auth', auth);
    });
    universal.sendEvent('init');
    universal.sendEvent('loadHooks');
    resolve(true);
  })
}