const fs = require('fs');
const path = require('path');

const debug = require(path.resolve('./src/utils/debug.js'));

const sc = {
  _cache: {},
  settings: () => {
    debug.log('Settings accessed.');
    if (Object.keys(sc._cache).length === 0) {
      sc.update();
    }
    return sc._cache;
  },
  update: () => {
    delete require.cache[require.resolve(path.resolve('./src/configs/config.fd.js'))];
    sc._cache = require(path.resolve('./src/configs/config.fd.js'));
  },
  save: () => {
    const set = sc.settings();
    // Sorry ESLint overlords, but this has to be done.
    // eslint-disable-next-line max-len
    const cfgStr = `const cfg = {writeLogs:${sc._cache.writeLogs},release:"${sc._cache.release ? sc._cache.release : 'stable'}",profiles:${JSON.stringify(sc._cache.profiles)},theme:"${sc._cache.theme ? sc._cache.theme : 'default'}",profile:"${sc._cache.profile}",screenSaverActivationTime:${set.screenSaverActivationTime},soundOnPress:${set.soundOnPress},useAuthentication:${set.useAuthentication},iconCountPerPage:${set.iconCountPerPage},port:${set.port}}; if(typeof window !== 'undefined') window['cfg'] = cfg; if('exports' in module) module.exports = cfg;`;
    return fs.writeFileSync(path.resolve('./src/configs/config.fd.js'), cfgStr);
  },
};

module.exports = sc;
