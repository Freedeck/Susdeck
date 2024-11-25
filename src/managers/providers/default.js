const fs = require("node:fs");
const path = require("node:path");
const AsarBundleRunner = require("asar-bundle-runner");
const picocolors = require(path.resolve("./src/utils/picocolors.js"));

module.exports = async ({ debug, file, pl }) => {
  const a = await AsarBundleRunner.extract(`./plugins/${file}`, false);
  const instantiated = await AsarBundleRunner.run(a);
  console.log(picocolors.yellow(
    `[Plugin Manager / ${file}] ASAR format plugins are being phased out. Please use .fdpackage plugins instead.`
  ))
  debug.log(
    picocolors.yellow(
      `Plugin initialized ${instantiated.name} - ID ${instantiated.id}`
    ),
    "Plugin Manager"
  );
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
};
