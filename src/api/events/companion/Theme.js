const fs = require('fs')
const path = require('path')
const debug = require('../../../cliUtil')

module.exports = {
  event: 'c-theme',
  callback: (socket, args) => {
    debug.log('Set theme: ' + args)
    fs.writeFileSync(path.join(path.dirname(require.main.filename)+"/api/persistent/theme.sd"), args)
    return 'c-change'
  }
}
