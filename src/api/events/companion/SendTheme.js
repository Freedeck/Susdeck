module.exports = {
  event: 'c-send-theme',
  callback: (socket, args) => {
    socket.emit('custom_theme', args);
  }
};
