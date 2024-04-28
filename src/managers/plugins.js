const fs = require('fs');
const path = require('path');
const debug = require(path.resolve('./src/utils/debug.js'));
const picocolors = require(path.resolve('./src/utils/picocolors.js'));
const AsarBundleRunner = require('asar-bundle-runner');

const {Worker} = require('node:worker_threads'); 

const pl = {
  _plc: new Map(),
  _disabled: [],
  _tyc: new Map(),
  _ch: new Map(),
  plugins: () => {
    debug.log('Plugins accessed.');
    if (pl._plc.length >= 0) pl.update();
    return pl._plc;
  },
  reload: () => {
    const plList = pl.plugins();
    plList.forEach((plugin) => {
      plugin.instance.stop();
      plList.delete(plugin.id);
    });
    pl.types().forEach((type) => {
      type.instance.stop();
      pl._tyc.delete(type.id);
    });
    for (const key in require.cache) {
      if (key.startsWith(path.resolve('./tmp'))) {
        delete require.cache[key];
      }
    }
    pl.update();
  },
  update: async () => {
    pl._disabled = [];
    pl._plc.clear();
    pl._tyc.clear();
    const files = fs.readdirSync(path.resolve('./plugins'));
    for (const file of files) {
      if (file.endsWith('.disabled')) {
        pl._disabled.push(file);
        continue;
      }
      if (!file.endsWith('.Freedeck')) continue;
      try {
        await pl.load(file);
      } catch (er) {
        console.log(er);
      }
    }
  },
  load: async (file) => {
    try {
      const a = await AsarBundleRunner.extract('./plugins/' + file);
      const instantiated = await AsarBundleRunner.run(a);
      debug.log(picocolors.yellow('Plugin initialized ' + instantiated.name + ' - ID ' + instantiated.id), 'Plugin Manager');
      pl._plc.set(instantiated.id, {instance: instantiated});
    } catch (err) {
      console.log(picocolors.red('Error while trying to load plugin ' + file + ': ' + err), 'Plugin Manager');
    }
  },
  types: () => {
    return pl._tyc;
  },
};

module.exports = pl;
