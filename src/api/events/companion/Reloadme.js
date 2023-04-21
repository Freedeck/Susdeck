module.exports = {
  event: 'c-change-client',
  callback: (socket, args, loginList) => {
    socket.emit('c-change');
  }
};
