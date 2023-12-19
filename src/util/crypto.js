const crypto = require('crypto');

const cryptoa = {
  createHash: (input) => {
    return crypto.createHash('sha512').update(input).digest('hex');
  },
  createHash256: (input) => {
    return crypto.createHash('sha256').update(input).digest('hex');
  },
  createHashMd5: (input) => {
    return crypto.createHash('md5').update(input).digest('hex');
  }
};

module.exports = cryptoa;
