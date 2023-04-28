module.exports = {
  event: 'c-del-theme',
  callback: (socket, args) => {
    return 'custom_theme=del';
  }
};
