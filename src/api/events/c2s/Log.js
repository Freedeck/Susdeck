module.exports = {
  event: 'c2s_log',
  callback: (socket, args, isDebug) => {
    if (isDebug) {
      require('../../../util/debug').log(args);
      return;
    }
    console.log(args);
  }
};
