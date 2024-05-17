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

const handoffData = {
  genTime: Date.now(),
  token: Math.random().toString(36).substring(2, 15) + '@h' + Math.random().toString(36).substring(2, 15),
  hasAccessed: false,
};

app.get('/handoff/get-token', (req, res) => {
  if (handoffData.genTime + 60000 < Date.now()) {
    handoffData.token = Math.random().toString(36).substring(2, 15) + '@h' + Math.random().toString(36).substring(2, 15);
    handoffData.genTime = Date.now();
    handoffData.hasAccessed = false;
  }
  if (!handoffData.hasAccessed) {
    // handoffData.hasAccessed = true;
    res.send(handoffData.token);
  }
  res.send('0'.repeat(handoffData.token.length));
});

app.get('/handoff/:token/download-plugin/:link', (req, res) => {
  if (req.params.token !== handoffData.token) res.send({status: 'error', message: 'Invalid token'});
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
  res.send({status: 'success', message: 'Reloaded plugins.'});
});

app.get('/fdc', (req, res) => res.sendStatus(200));
app.get('/fdc/webpack', (req, res) => {
  res.send({compiled: hasWebpackCompiled});
});
app.get('/fdc/time', (req, res) => {
  res.send({data: compileTime});
});
app.get('/fdc/compile/:token', (req, res) => {
  if (req.params.token === settings.token) {
    compileWebpack().then(() => {
      res.send({compiled: hasWebpackCompiled});
    });
  } else {
    res.sendStatus(401);
  };
});

app.post('/fd/api/upload/', (request, response) => {
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

    fs.renameSync(nfp, nfp + '.' + ext);
    response.send({oldName: files.file[0].originalFilename, newName: files.file[0].newFilename + '.' + ext});
  });
});

server.listen(PORT, () => {
  Object.keys(networkAddresses()).forEach((netInterface) => {
    const ipPort = networkAddresses()[netInterface][0] + ':' + PORT;
    console.log(picocolors.bgBlue('Go to ' + ipPort + ' on your mobile device [Interface ' + netInterface + ']'));
  });
});
