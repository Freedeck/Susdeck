const sounds = require('../../../sounds')
const fs = require('fs')

module.exports = {
  event: 'c-delkey',
  callback: (socket, args) => {
    sounds.Sounds.splice(sounds.Sounds.indexOf({ name: args.name, key: args.key }), 1)
    fs.writeFileSync('./src/settings/sounds.js', `const SoundOnPress = ${sounds.SoundOnPress}
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime}
const Sounds = ${JSON.stringify(sounds.Sounds)}
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, Sounds }`)
    return 'c-change'
  }
}
