module.exports = {
  event: 'c-send-theme',
  callback: (socket, args) => {
    return 'custom_theme=' + args;
  }
};
