const crypto = require('crypto');

module.exports = {
    s: {
        password: 'fd.7ee844808ce406d965365f95a85e0ff13323a6ed0a25a088362cefd3f03d8203d4a09de4a427a8ec6d1239d060088d181c7452dfec7e0acda73771a57c6d83ad',
    },
    hash: (data) => 'fd.' + crypto.createHash('sha512').update(data).digest().toString('hex')
}