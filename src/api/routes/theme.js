const fs = require('fs');

module.exports = {
  type: 'get',
  route: 'theme',
  exec: (request, response) => {
    response.send({ theme: fs.readFileSync('../persistent/theme.sd').toString('utf-8') });
  }
};
