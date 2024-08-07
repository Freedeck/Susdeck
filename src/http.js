const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const picocolors = require('./utils/picocolors');

const app = express();
const server = http.createServer(app);
const formidable = require('formidable');
let hasWebpackCompiled = 0;
const config = require('./managers/settings');
const notifMan = require('./managers/notifications');

const settings = config.settings();
const PORT = settings.port || 5754;

const networkAddresses = require('./managers/networkAddresses');

module.exports = {
  http,
  server,
  app,
  compileWebpack,
};

const {webpack} = require('webpack');
const webpackConfig = require('../webpack.config');
if (!fs.existsSync(path.resolve('./src/public/companion/dist'))) {
  console.log('Welcome to Freedeck! This is your first time running Freedeck, so it will take a moment to set up.');
  console.log('Creating companion/dist directory');
  fs.mkdirSync(path.resolve('./src/public/companion/dist'));
}

if (!fs.existsSync(path.resolve('./src/public/dist'))) {
  console.log('Creating dist directory');
  fs.mkdirSync(path.resolve('./src/public/dist'));
}

let compileTime = 0;

/**
 *  run webpack
 * @param {*} wp  a
 * @return {true}
*/
function runWebpack(wp) {
  return new Promise((resolve, reject) => {
    wp.run((err, stats) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        compileTime = (stats.endTime - stats.startTime);
        console.log('Compiled webpack bundles in ' + compileTime + 'ms');
        resolve();
      }
    });
  });
}

/**
 * compiled webpack
 * @return {Promise<void>}
*/
async function compileWebpack() {
  hasWebpackCompiled = 0;
  const wp = webpack(webpackConfig);
  await runWebpack(wp);
  hasWebpackCompiled += 1;
}

compileWebpack().catch((err) => console.error(err));

app.use(express.static(path.join(__dirname, './public')));

const plugins = require('./managers/plugins');
const tsm = require('./managers/temporarySettings');

const handoffData = {
  genTime: Date.now(),
  token: Math.random().toString(36).substring(2, 15) + '@h' + Math.random().toString(36).substring(2, 15),
  hasAccessed: false,
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/handoff/get-token', (req, res) => {
  if (handoffData.genTime + 60000 < Date.now()) {
    handoffData.token = Math.random().toString(36).substring(2, 15) + '@h' + Math.random().toString(36).substring(2, 15);
    handoffData.genTime = Date.now();
    handoffData.hasAccessed = false;
  }
  if (!handoffData.hasAccessed) {
    // handoffData.hasAccessed = true;
    return res.send(handoffData.token);
  }
  res.send('0'.repeat(handoffData.token.length));
});

app.get('/handoff/:token/download-plugin/:link', (req, res) => {
  if (req.params.token !== handoffData.token) return res.send({status: 'error', message: 'Invalid token'});
  const stream = fs.createWriteStream(path.resolve('./plugins/' + req.params.link.split('/').pop()));
  http.get(req.params.link, (response) => {
    response.pipe(stream);
    stream.on('finish', () => {
      stream.close();
      plugins.reload();
      res.send({status: 'success', message: 'Downloaded plugin & reloaded plugins.'});
    });
  });
});

app.get('/handoff/:token/reload-plugins', (req, res) => {
  if (req.params.token !== handoffData.token) res.send({status: 'error', message: 'Invalid token'});
  plugins.reload();
  notifMan.add('handoff-api', 'reload-plugins');
  res.send({status: 'success', message: 'Reloaded plugins.'});
});

app.get('/handoff/:token/notify/:data', (req, res) => {
  if (req.params.token !== handoffData.token) res.send({status: 'error', message: 'Invalid token'});
  notifMan.add('Handoff', req.params.data);
  res.send({status: 'success', message: 'Sent notification.'});
});

app.get('/native/*', (req,res) => {
  fetch('http://localhost:5756/' + req.url.split('/').slice(2).join('/')).then((res)=>res.json()).then((a) => {
    res.send(a);
  }).catch((err) => {
    res.send({_msg: 'NativeBridge is not running.', error: err});
  })
})

app.get('/connect/plugins', (req,res) => {
  let idList = [];
  let pl = plugins._plc.keys();
  for(let key of pl) {
    idList.push(key);
  }
  res.send({plugins: idList});
})
app.get('/connect/status', (req, res) => res.sendStatus(200));
app.get('/connect/webpack', (req, res) => {
  res.send({compiled: hasWebpackCompiled});
});
app.get('/connect/local-ip', (req, res) => {
  res.send({ip: networkAddresses()});
});
app.get('/connect/dev-status', (req, res) => {
  res.send({
    message: tsm.get('isMobileConnected') ?
      'Your device is connected to Freedeck!' :
      'Your device is not connected to Freedeck!',
    state: tsm.get('isMobileConnected'),
  });
});
app.post('/fd/api/upload/sound', (request, response) => {
  const form = new formidable.IncomingForm({
    uploadDir: path.resolve('./src/public/sounds'),
  });
  // Parse `req` and upload all associated files
  form.parse(request, (err, fields, files) => {
    if (err) {
      return response.status(400).json({error: err.message});
    }

    const nfp = files.file[0].filepath;
    const ext = files.file[0].mimetype.split('/')[1];
    const originalName = files.file[0].originalFilename.split('.')[0];

    fs.renameSync(nfp, path.resolve('./src/public/sounds/' + originalName + '.' + ext));
    
    response.send({oldName: files.file[0].originalFilename, newName: originalName + '.' + ext});
  });
});

app.post('/fd/api/upload/icon', (request, response) => {
  const form = new formidable.IncomingForm({
    uploadDir: path.resolve('./src/public/us-icons'),
  });
  // Parse `req` and upload all associated files
  form.parse(request, (err, fields, files) => {
    if (err) {
      return response.status(400).json({error: err.message});
    }

    const nfp = files.file[0].filepath;
    const ext = files.file[0].mimetype.split('/')[1];
    const originalName = files.file[0].originalFilename.split('.')[0];

    try {
      fs.renameSync(nfp, path.resolve('./src/public/us-icons/' + originalName + '.' + ext));
    } catch (err) {
      console.error('Error while renaming file', err);
    }

    response.send({oldName: files.file[0].originalFilename, newName: originalName + '.' + ext});
  });
});

server.listen(PORT, () => {
  Object.keys(networkAddresses()).forEach((netInterface) => {
    const ipPort = networkAddresses()[netInterface][0] + ':' + PORT;
    console.log(picocolors.bgBlue('Go to ' + ipPort + ' on your mobile device [Interface ' + netInterface + ']'));
  });
});
