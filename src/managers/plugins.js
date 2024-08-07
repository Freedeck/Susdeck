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
  _settings: new Map(),
  plugins: () => {
    debug.log('Plugins accessed.');
    if (pl._plc.length >= 0) pl.update();
    return pl._plc;
  },
  reload: async () => {
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
    await pl.update();
  },
  update: async () => {
    console.log('This may take a second- we\'re rebuilding the plugin cache.');
    pl._disabled = [];
    pl._plc.clear();
    pl._tyc.clear();
    const files = fs.readdirSync(path.resolve('./plugins'));
    const loadPromises = files.filter((file) => file.endsWith('.Freedeck') || file.endsWith('.src') || file.endsWith('.fdr.js') && !file.endsWith('.disabled')).map((file) => pl.load(file));
    try {
      await Promise.all(loadPromises);
    } catch (er) {
      console.log(er);
    }
  },
  singleFile: async (file) => {
    debug.log('--- You\'re loading a single file plugin, this may take a second. ---');
    debug.log('--- If you\'re the developer of the plugin (' + file + '), please ensure you know:\n 1. Hooks are UNSUPPORTED, and may be unstable due to the nature of the plugin system.');
    debug.log('--- If you do make hooks work, kindly ensure that it doesn\'t crash consistently. ---');
    debug.log('--- 2. You must use CommonJS to export (module.exports) your plugin, and it must be a class. ---');
    debug.log('--- With that out of the way, let\'s load the plugin. ---');
    const ipl = require(path.resolve('./plugins/' + file));
    const instantiated = new ipl();
    pl._plc.set(instantiated.id, { instance: instantiated });
    if (instantiated.disabled) {
      pl._disabled.push(instantiated.id);
    }
    if (fs.existsSync(path.resolve('./plugins/' + instantiated.id + '/settings.json'))) {
      const settings = JSON.parse(fs.readFileSync(path.resolve('./plugins/' + instantiated.id + '/settings.json')));
      pl._settings.set(instantiated.id, settings);
    }
    debug.log('Successfully loaded single file plugin ' + file);

  },
  load: async (file) => {
    try {
      if (file.endsWith('.fdr.js')) {
        try {
          pl.singleFile(file);
        } catch(err) {
          console.error(picocolors.red('Error while trying to load single file plugin ' + file + ': ' + err), 'Plugin Manager');
        }
        return;
      }
      if (file.endsWith('.src')) {
        debug.log('--- You\'re loading an unpacked plugin, this may take a second! --- ');
        debug.log('--- Do remember to run your plugin through the dev-env (or ASAR package it, and replace asar with Freedeck)! ---');
        const newPath = path.resolve('./plugins/' + file);
        const cfgPath = path.resolve(newPath, 'config.js');
        try {
          debug.log(picocolors.yellow('Initializing unpacked plugin ' + file), 'Plugin Manager');
          const { entrypoint } = require(cfgPath);
          const entryPath = path.resolve(newPath, entrypoint);
          const entry = require(entryPath);
          debug.log('--- Emulating ASAR extraction, then we\'ll load. --- ');
          fs.cpSync(newPath, path.resolve('./tmp/_e_._plugins_' + file.split(".src")[0] + '.Freedeck'), {recursive:true});
          debug.log('--- Loading. --- ');
          const instantiated = entry.exec();
          pl._plc.set(instantiated.id, { instance: instantiated });
          if (instantiated.disabled) {
            pl._disabled.push(instantiated.id);
          }
          if (fs.existsSync(path.resolve('./plugins/' + instantiated.id + '/settings.json'))) {
            const settings = JSON.parse(fs.readFileSync(path.resolve('./plugins/' + instantiated.id + '/settings.json')));
            pl._settings.set(instantiated.id, settings);
          }
          return;
        } catch (err) {
          console.error(picocolors.red('Error while trying to load unpacked plugin ' + file + ': ' + err), 'Plugin Manager');
        }
        return;
      }
      const a = await AsarBundleRunner.extract('./plugins/' + file, true);
      const instantiated = await AsarBundleRunner.run(a);
      debug.log(picocolors.yellow('Plugin initialized ' + instantiated.name + ' - ID ' + instantiated.id), 'Plugin Manager');
      pl._plc.set(instantiated.id, { instance: instantiated });
      if (instantiated.disabled) {
        pl._disabled.push(instantiated.id);
      }
      if (fs.existsSync(path.resolve('./plugins/' + instantiated.id + '/settings.json'))) {
        const settings = JSON.parse(fs.readFileSync(path.resolve('./plugins/' + instantiated.id + '/settings.json')));
        pl._settings.set(instantiated.id, settings);
      }
    } catch (err) {
      console.log(picocolors.red('Error while trying to load plugin ' + file + ': ' + err), 'Plugin Manager');
    }
  },
  types: () => {
    return pl._tyc;
  },
};

module.exports = pl;
