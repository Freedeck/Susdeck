const path = require("node:path");
const { EsbuildPlugin } = require('esbuild-loader')

const cfg = {
  mode: "development",
  entry: {
    main: path.resolve("webui/companion/scripts/main.js"),
    settingsThemes: path.resolve("webui/companion/scripts/settingsThemes.js"),
    clientMain: path.resolve("webui/client/scripts/main.js"),
  },
  output: {
    path: path.resolve("webui/app"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  externals: {
    Pako: "Pako",
    settingsHelpers: "settingsHelpers",
  },
};

module.exports = cfg;
