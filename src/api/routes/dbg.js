const debug = require('../../cliUtil')

module.exports = {
    type: 'get',
    route: 'dbg',
    exec: (request, response) => {
        response.send({ status: debug.is })
    }
}