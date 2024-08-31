const { webpack } = require("webpack");
const fs = require("node:fs");
const path = require("node:path");
const webpackConfig = require("../webpack.config");
const setWsStateHttp = require(path.resolve("src/routers/connect.js")).webpackState;
let compileTime = 0;

/**
 *  run webpack
 * @param {*} wp  a
 * @return {true}
 */
function runWebpack(webpackInstance) {
  if (!fs.existsSync(path.resolve("webui/app"))) {
    console.log(
      "Welcome to Freedeck! This is your first time running Freedeck, so it will take a moment to set up.",
    );
    console.log("Creating webui/app directory");
    fs.mkdirSync(path.resolve("webui/app"));
  }

  return new Promise((resolve, reject) => {
    webpackInstance.run((err, stats) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        compileTime = stats.endTime - stats.startTime;
        console.log(`Compiled webpack bundles in ${compileTime}ms`);
        resolve();
      }
    });
  });
}

/**
 * Create the webpack compiler instance & use it asynchronously.
 * @return {Promise<void>}
 */
async function compileWebpack() {
  setWsStateHttp(0);
  const webpackInstance = webpack(webpackConfig);
  await runWebpack(webpackInstance);
  setWsStateHttp(1);
  console.log("Webpack bundles compiled.");
}

module.exports = {
  compileWebpack,
  hasWebpackCompiled,
  compileTime,
};
