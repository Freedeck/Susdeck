const sounds = require('../sounds')

module.exports = {
  event: 'c-newkey',
  callback: (socket, args) => {
    sounds.Sounds.push(args)
  }
}
