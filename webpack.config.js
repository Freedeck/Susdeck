const path = require('path');

const cfg = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/public/companion/scripts/main.js'),
    pluginPage: path.resolve(__dirname, './src/public/companion/scripts/pluginPage.js'),
    marketplacePage: path.resolve(__dirname, './src/public/companion/scripts/marketplacePage.js'),
    settingsPage: path.resolve(__dirname, './src/public/companion/scripts/settingsPage.js'),
    settingsThemes: path.resolve(__dirname, './src/public/companion/scripts/settingsThemes.js'),
    clientMain: path.resolve(__dirname, './src/public/scripts/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'src/public/companion/dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  externals: {
    Sortable: 'Sortable',
    settingsHelpers: 'settingsHelpers',
  },
  devtool: 'source-map',
};

module.exports = cfg;

