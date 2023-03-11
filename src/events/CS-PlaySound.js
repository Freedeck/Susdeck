
module.exports = {
  event: 'cs-playsound',
  callback: (socket, args) => {
    const sid = args
    console.log(sid)
  }
}
