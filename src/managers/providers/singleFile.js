const fs = require("node:fs");
const path = require("node:path");
const picocolors = require(path.resolve("./src/utils/picocolors.js"));

module.exports = ({ debug, file, pl }) => {
  debug.log(
    "You're loading a single file plugin. Expect unexpected behavior.",
    "Plugin Manager"
  );
  const ipl = require(path.resolve(`./plugins/${file}`));
  const instantiated = new ipl();
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
  debug.log(`Successfully loaded single file plugin ${file}`, "Plugin Manager");
};
