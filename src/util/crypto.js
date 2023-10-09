const crypto = require('crypto');

const cryptoa = {
  createHash: (input) => {
    crypto.createHash('sha512').update(input).digest('hex');
  }
};

module.exports = cryptoa;
