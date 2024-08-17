const path = require('path');

const cfg = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/public/companion/scripts/main.js'),
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
  }
};

module.exports = cfg;

