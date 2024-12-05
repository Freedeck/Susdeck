const fs = require("node:fs");
const path = require("node:path");
const picocolors = require(path.resolve("./src/utils/picocolors.js"));

module.exports = ({debug, file, pl}) => {
  debug.log(
    "Loading unpacked plugin. Keep in mind disabling/enabling will not work.",
    "Plugins"
  );
  const newPath = path.resolve(`./plugins/${file}`);
  const cfgPath = path.resolve(newPath, "config.js");
  try {
    debug.log(
      picocolors.yellow(`Initializing unpacked plugin ${file}`),
      "Plugins"
    );
    const { entrypoint } = require(cfgPath);
    const entryPath = path.resolve(newPath, entrypoint);
    const entry = require(entryPath);
    debug.log("Emulating asar extraction...", "Plugins");
    fs.cpSync(
      newPath,
      path.resolve(`./tmp/_e_._plugins_${file.split(".src")[0]}.Freedeck`),
      { recursive: true }
    );
    debug.log("Executing plugin...", "Plugins");
    const instantiated = entry.exec();
    pl._plc.set(instantiated.id, { file, instance: instantiated });
    if (instantiated.disabled) {
      pl._disabled.push(file);
    }
    if (
      fs.existsSync(path.resolve(`./plugins/${instantiated.id}/settings.json`))
    ) {
      const settings = JSON.parse(
        fs.readFileSync(
          path.resolve(`./plugins/${instantiated.id}/settings.json`)
        )
      );
      pl._settings.set(instantiated.id, settings);
    }
    debug.log(
      picocolors.green(
        `Plugin loaded: ${instantiated.name} (${instantiated.id})`
      ),
      "Plugins / Source"
    );
    return;
  } catch (err) {
    console.error(
      picocolors.red(
        `Error while trying to load unpacked plugin ${file}: ${err}`
      ),
      "Plugins"
    );
  }
};
