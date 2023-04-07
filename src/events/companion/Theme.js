const fs = require('fs')
const debug = require('../../cliUtil')

module.exports = {
  event: 'c-theme',
  callback: (socket, args) => {
    debug.log('Set theme: ' + args)
    fs.writeFileSync('./src/persistent/theme.sd', args)
    return 'c-change'
  }
}
