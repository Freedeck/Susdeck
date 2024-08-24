const path = require("node:path");

const cfg = {
	mode: "development",
	entry: {
		main: path.resolve(__dirname, "./src/public/companion/scripts/main.js"),
		settingsThemes: path.resolve(
			__dirname,
			"./src/public/companion/scripts/settingsThemes.js",
		),
		clientMain: path.resolve(__dirname, "./src/public/scripts/main.js"),
	},
	output: {
		path: path.resolve(__dirname, "src/public/companion/dist"),
		filename: "[name].js",
	},
	devtool: 'source-map',
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
		Sortable: "Sortable",
		Pako: "Pako",
		settingsHelpers: "settingsHelpers",
	},
};

module.exports = cfg;
