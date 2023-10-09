const crypto = require('crypto');

const cryptoa = {
  createHash: (input) => {
    return crypto.createHash('sha512').update(input).digest('hex');
  }
};

module.exports = cryptoa;
