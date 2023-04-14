const debug = require('../../util/debug')

module.exports = {
  type: 'get',
  route: 'dbg',
  exec: (request, response) => {
    response.send({ status: debug.is, msg: debug.stat })
  }
}
