const fs = require('fs');

module.exports = {
  type: 'get',
  route: 'theme',
  exec: (request, response) => {
    response.send({ theme: fs.readFileSync(require('path').resolve(__dirname, '../persistent/theme.sd')).toString('utf-8') });
  }
};
