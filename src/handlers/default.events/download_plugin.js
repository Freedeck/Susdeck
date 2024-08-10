const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const eventNames = require('../eventNames');
const path = require('path');

const plugins = require('../../managers/plugins');

module.exports = ({io, data}) => {
  data = JSON.parse(data);
  console.log(`Downloading plugin ${data.id} from ${data.server}`);
  const file = fs.createWriteStream(path.resolve('./plugins/' + data.id + '.Freedeck'));
  http.get(data.file, function(response) {
    response.pipe(file);

    // after download completed close filestream
    file.on('finish', () => {
      file.close();
      io.emit(eventNames.default.plugin_downloaded);
      console.log('Plugin ' + data.id + ' downloaded. Enabling (Reloading)...');
      if (plugins._plc.has(data.id)) {
        console.log('Plugin already exists, overwriting...');
        plugins._plc.delete(data.id);
      }
      plugins.reload();
      io.emit(eventNames.default.plugins_updated);
    });
    file.on('error', (err) => {
      console.log('Error while trying to download ' + data.id +': ', err);
    });
  });
};
