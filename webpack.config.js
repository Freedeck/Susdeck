const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/public/companion/scripts/main.js'),
  output: {
    path: path.resolve(__dirname, 'src/public/companion/dist'),
    filename: 'bundle.js',
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
	Sortable: 'Sortable' // This will keep "Sortable" as a global variable
  }
};

