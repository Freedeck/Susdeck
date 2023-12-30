const fs = require('fs');
const path = require('path');

const sc = {
  _cache: {},
  settings: () => {
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
    // console.log(sc.settings())
    const set = sc.settings();
    // Sorry ESLint overlords, but this has to be done.
    // eslint-disable-next-line max-len
    return fs.writeFileSync(path.resolve('./src/configs/config.fd.js'), `const cfg = {profiles:${JSON.stringify(sc._cache.profiles)},profile:"${sc._cache.profile}",screenSaverActivationTime:${set.screenSaverActivationTime},soundOnPress:${set.soundOnPress},useAuthentication:${set.useAuthentication},iconCountPerPage:${set.iconCountPerPage},port:${set.port}}; if(typeof window !== 'undefined') window['cfg'] = cfg; if('exports' in module) module.exports = cfg;`);
  },
};

module.exports = sc;
