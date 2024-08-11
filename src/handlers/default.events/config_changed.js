const path = require('path');
const eventNames = require('../eventNames');
const fs = require('fs');

module.exports = ({io, data}) => {
  if(!fs.existsSync(path.resolve('./src/configs/style.json'))) {
    fs.writeFileSync(path.resolve('./src/configs/style.json'), JSON.stringify({ scroll: false, fill:false, 'font-size': 15, buttonSize: 6, iconCountPerPage:12, longPressTime: 3, tileRows: 5 }));
  }
  fs.writeFileSync(path.resolve('./src/configs/style.json'), data);
  io.emit(eventNames.default.config_changed, data);
};
