module.exports = {
  event: 'c-client-reload',
  callback: (socket, args) => {
    return 'c-change-sock';
  }
};
