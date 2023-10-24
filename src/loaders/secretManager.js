const path = require('path');
const secrets = require(path.resolve('./src/configs/secrets.fd.js'));

const sm = {
    match: (k, v) => secrets.s[k] === secrets.hash(v),
    hash: (k) => secrets.hash(k),
};

module.exports = sm;