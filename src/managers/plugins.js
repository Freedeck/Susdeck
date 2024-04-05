const fs = require('fs');
const path = require('path');
const debug = require(path.resolve('./src/utils/debug.js'));
const picocolors = require(path.resolve('./src/utils/picocolors.js'));
const AsarBundleRunner = require('asar-bundle-runner');

const pl = {
  _plc: new Map(),
  _tyc: new Map(),
  _ch: new Map(),
  plugins: () => {
    if (pl._plc.length >= 0) pl.update();
    return pl._plc;
  },
  update: () => {
    console.log('Updating plugin library at ' + path.resolve('./plugins'));
    fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
      if (!file.endsWith('.Freedeck')) return;
      AsarBundleRunner.extract('./plugins/' + file).then((a) => {
        AsarBundleRunner.run(a).then((instantiated) => {
          debug.log(picocolors.yellow('Plugin initialized ' + instantiated.name + ' - ID ' + instantiated.id), 'Plugin Manager');
          pl._plc.set(instantiated.id, {instance: instantiated});
        });
      });
    });
  },
  types: () => {
    return pl._tyc;
  },
};

module.exports = pl;
