module.exports = {
  event: 'c2s_log',
  callback: (socket, args) => {
    require('../../cliUtil').log(args[0])
  }
}
