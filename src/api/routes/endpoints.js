const { apiEvents, sockApiEvents } = require('../init');

module.exports = {
  type: 'get',
  route: 'endpoints',
  exec: (request, response) => {
    const apiArr = [];
    const sockArr = [];

    apiEvents.forEach(ev => {
      apiArr.push(ev);
    });

    sockApiEvents.forEach(ev => {
      sockArr.push(ev);
    });

    response.send({ api: apiArr, sock: sockArr });
  }
};
