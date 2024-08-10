import { generic, handler } from "../../companion/scripts/native/handler";

export default function dataHandler(universal, user) {
  return new Promise((ress, rejj) => {
    universal.once('I', async (data) => {
      universal.connected = true;
      window['universal'] = universal;
  
      data = await universal.asyncDecompressGzipBlob(data);
      const parsed = JSON.parse(data);
      universal._information = JSON.parse(data);
      universal.events = parsed.events;
      universal.config = parsed.cfg;
      universal.config.sounds = parsed.cfg.profiles[parsed.cfg.profile];
      universal.plugins = parsed.plugins;
      universal._serverRequiresAuth = universal.config.useAuthentication;
      universal._init = true;
  
      // default setup
      universal.CLU('Boot', data, parsed, universal, universal.events)
  
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
      universal.default('local-cfg', JSON.stringify({ scroll: false, fill:false, 'font-size': 15, buttonSize: 6, iconCountPerPage:12, longPressTime: 3, tileRows: 5 }));
  
      if (!universal.load('welcomed')) {
        universal.sendToast('Welcome to Freedeck.');
        universal.save('welcomed', 'true');
      }
  
      universal.save('tempLoginID', parsed.tempLoginID);
  
      universal.keys.id = 'keys';
      if (!document.querySelector('#keys')) {
        document.body.appendChild(universal.keys);
      }
  
      universal.notibar.id = 'snackbar';
      if (!document.querySelector('#snackbar')) {
        document.body.appendChild(universal.notibar);
      }
  
      universal.send(universal.events.information, { apiVersion: '2' });
  
      universal.keySet();
  
      universal.repositoryManager.unofficial = universal.loadObj('repos.community') || [];
  
      Object.keys(universal.plugins).forEach((plugin) => {
        const plug = universal.plugins[plugin];
        plug.types.forEach((type) => {
          universal._tyc.set(type, plug);
        });
      });
  
      if (user == 'Companion') {
        handler();
      }
  
      if (universal.loadObj('local-cfg').fontSize != 15) {
        document.documentElement.style.setProperty('--fd-font-size', universal.loadObj('local-cfg').fontSize + 'px');
      }
  
      generic();
      ress(true);
    });
  });
};
