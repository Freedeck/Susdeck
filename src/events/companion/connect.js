module.exports = {
  event: 'connect',
  callback: (req, res) => {
    // This is a placeholder function for now but Companion will just check server status for now..
    res.send('success')
  }
}
