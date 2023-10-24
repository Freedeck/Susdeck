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
        delete require.cache[require.resolve(path.resolve('./src/configs/config.fd.js'))]
        sc._cache = require(path.resolve('./src/configs/config.fd.js'));
    },
    save: () => {
        // console.log(sc.settings())
        let set = sc.settings();
        return fs.writeFileSync(path.resolve('./src/configs/config.fd.js'), `const cfg = {sounds:${JSON.stringify(set.sounds)},screenSaverActivationTime:${set.screenSaverActivationTime},soundOnPress:${set.soundOnPress},iconCountPerPage:${set.iconCountPerPage}}; if(typeof window !== 'undefined') window['cfg'] = cfg; if('exports' in module) module.exports = cfg;`)
    }
};

module.exports = sc;