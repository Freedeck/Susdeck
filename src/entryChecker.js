const fs = require('fs')
const path = require('path')
const picocolors = require(path.resolve('./src/utils/picocolors'))

const DOES_SETTINGS_EXIST_YET = fs.existsSync(path.resolve('./src/configs/config.fd.js'));

if (!DOES_SETTINGS_EXIST_YET) {
  console.log(picocolors.bgRed('No config file found!'));
  require(path.resolve('./Setup.js'))
} else {
	require(path.resolve('./src/index.js'));
}