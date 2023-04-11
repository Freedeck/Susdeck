module.exports = {
  event: 'c2s_log',
  callback: (socket, args) => {
    require('../../../util/debug').log(args)
  }
}
