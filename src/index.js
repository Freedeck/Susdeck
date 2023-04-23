const ex = require('express');
const path = require('path');
const httpLib = require('http');

const app = ex();
const httpServer = new httpLib.Server(app);
const io = require('socket.io')(httpServer);

const getNetworkInterfaces = require('./util/network');
const sockApiInit = require('./api/init');

const port = process.env.PORT || 3000;

sockApiInit(io, app); // Socket API initialize

app.use('/', ex.static('./src/app')); // Initialize HTTP routes for main web app directory

app.get('/sounds.js', (req, res) => { res.sendFile(path.join(__dirname, '/settings/sounds.js')); }); // Make sounds.js accessible from apps

httpServer.listen(port, () => {
  console.log('Susdeck v' + require('../package.json').version + ' Web Host is starting - starting Companion');
  require('child_process').exec('npx electron src/companion'); // Start Companion on another process
  Object.keys(getNetworkInterfaces()).forEach(netinterface => {
    console.log('Go to ' + getNetworkInterfaces()[netinterface][0] + ':3000 on your mobile device [Interface ' + netinterface + ']');
  });
});
