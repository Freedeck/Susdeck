const fs = require("node:fs");
const path = require("node:path");

const picocolors = require("$/picocolors.js");
const debug = require("$/debug.js");

const configLocation = path.resolve("./src/configs/config.fd.js");
const styleLocation = path.resolve("./src/configs/style.json");

const sc = {
  _cache: {},
  settings: () => {
    if (Object.keys(sc._cache).length === 0) {
      sc.update();
      debug.log("Settings updated.", "Settings Cache");
    }
    return sc._cache;
  },
  styleSettings: {
    scroll: false,
    fill: false,
    center: false,
    animation: false,
    compact: true,
    "font-size": "15",
    buttonSize: "6",
    iconCountPerPage: "12",
    longPressTime: "3",
    tileCols: "5",
  },
  checkStyle: async () => {
    try {
      if (!fs.existsSync(styleLocation)) {
        const def = JSON.stringify(sc.styleSettings);
        await fs.writeFile(styleLocation, def, (e) => {
          if (e) {
            debug.log(
              `Error creating style configuration: ${e}`,
              "Style / Migration"
            );
          }
        });
        debug.log("Created default style configuration file.", "Style / Migration");
      } else {
        const data = JSON.parse(
          await fs.readFile(styleLocation, (e) => {
            if (e) {
              debug.log(
                `Error reading style configuration: ${e}`,
                "Style / Migration"
              );
            }
          })
        );
        for (const key in sc.styleSettings) {
          if (!data[key] || typeof data[key] !== typeof sc.styleSettings[key]) {
            data[key] = sc.styleSettings[key];
            debug.log(
              `Added ${picocolors.yellow(key)} to style.json`,
              "Style / Migration"
            );
          }
        }
        await fs.writeFile(styleLocation, JSON.stringify(data), (e) => {
          if (e) {
            debug.log(
              `Error saving style configuration: ${e}`,
              "Style / Migration"
            );
          } else {
            debug.log("Saved style configuration.", "Style / Migration");
          }
        });
        debug.log("Loaded style configuration from file.", "Style / Migration");
      }
    } catch (err) {
      debug.log(`Error in checkStyle: ${err}`, "Style / Migration");
    }
  },
  update: async () => {
    await sc.checkStyle();
    delete require.cache[require.resolve(configLocation)];
    sc._cache = require(configLocation);
    debug.log("Settings recached.", "Settings Cache");
  },
  save: () => {
    const set = sc.settings();
    const cfgStr = `const cfg = {writeLogs:${sc._cache.writeLogs},release:"${
      sc._cache.release ? sc._cache.release : "stable"
    }",profiles:${JSON.stringify(sc._cache.profiles)},theme:"${
      sc._cache.theme ? sc._cache.theme : "default"
    }",profile:"${sc._cache.profile}",screenSaverActivationTime:${
      set.screenSaverActivationTime
    },soundOnPress:${set.soundOnPress},useAuthentication:${
      set.useAuthentication
    },iconCountPerPage:${set.iconCountPerPage},port:${
      set.port
    }}; if(typeof window !== 'undefined') window['cfg'] = cfg; if('exports' in module) module.exports = cfg;`;
    return fs.writeFile(configLocation, cfgStr, (e) => {
      if (e) {
        console.log(`Error saving settings: ${e}`);
      } else {
        debug.log("Settings saved.", "Settings Cache");
      }
    });
  },
};

module.exports = sc;
