const fs = require('fs');
const path = require('path');
const debug = require(path.resolve('./src/utils/debug.js'));
const picocolors = require(path.resolve('./src/utils/picocolors.js'));
const AsarBundleRunner = require('asar-bundle-runner');

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
  update: () => {
    pl._disabled = [];
    pl._plc.clear();
    pl._tyc.clear();
    fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
      if (file.endsWith('.disabled')) {
        pl._disabled.push(file);
        return;
      }
      if (!file.endsWith('.Freedeck')) return;
      try {
        pl.load(file);
      } catch (err) {
        console.log(picocolors.red('Error while trying to load plugin ' + file + ': ' + err), 'Plugin Manager');
        if (err.includes('hooks')) {
          console.log('This seems to be a hook error. Hold on, because we\'re gonna try again.');
          pl.load(file);
        }
      }
    });
  },
  load: (file) => {
    AsarBundleRunner.extract('./plugins/' + file).then((a) => {
      AsarBundleRunner.run(a).then((instantiated) => {
        debug.log(picocolors.yellow('Plugin initialized ' + instantiated.name + ' - ID ' + instantiated.id), 'Plugin Manager');
        pl._plc.set(instantiated.id, {instance: instantiated});
      });
    });
  },
  types: () => {
    return pl._tyc;
  },
};

module.exports = pl;
