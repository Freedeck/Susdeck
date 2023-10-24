const path = require("path");
const Plugin = require(path.resolve('./src/classes/Plugin'));
const FreedeckAPI = require(path.resolve('./src/classes/FreedeckAPI'));

module.exports = class YTMD extends Plugin {
  _apiUrl = 'http://192.168.5.69:9863'; // Replace this with your API url.
  _prefix = 'roi.ytmd-controller.';
  _playerData = {};
  _songData = {};
  _lastSongData = {};
  constructor (isData = false) {
    super('YouTube Music Desktop', 'roighteously', 'roi.ytmd-controller', true, isData);
  }

  onButton (buttonData) {
    console.log(buttonData.type)
    if (buttonData.type === this._prefix + 'play') {
      this.sendCommand('track-pause');
      if (!this._playerData.isPaused) {
        FreedeckAPI.pushNotification(this._songData.title + ' by ' + this._songData.author + ' | Paused!');
      } else {
        FreedeckAPI.pushNotification(this._songData.title + ' by ' + this._songData.author + ' | Playing!');
      }
    }

    if (buttonData.type === this._prefix + 'now-playing') {
      FreedeckAPI.pushNotification('Now listening to: ' + this._songData.title + ' by ' + this._songData.author);
    }

    if (buttonData.type === this._prefix + 'volume-up') {
      this.sendCommand('player-volume-up');
      setTimeout(() => {
        fetch(this._apiUrl + '/query/player').then(res => res.json()).then(res => {
          FreedeckAPI.pushNotification('Volume: ' + res.volumePercent + '%');
        });
      }, 35);
    }

    if (buttonData.type === this._prefix + 'volume-down') {
      this.sendCommand('player-volume-down');
      setTimeout(() => {
        fetch(this._apiUrl + '/query/player').then(res => res.json()).then(res => {
          FreedeckAPI.pushNotification('Volume: ' + res.volumePercent + '%');
        });
      }, 35);
    }

    if (buttonData.type === this._prefix + 'next') {
      this.sendCommand('track-next');
    }

    if (buttonData.type === this._prefix + 'previous') {
      this.sendCommand('track-previous');
    }

    if (buttonData.type === this._prefix + 'thumbs-up') {
      this.sendCommand('player-thumbs-up');
    }

    if (buttonData.type === this._prefix + 'thumbs-down') {
      this.sendCommand('player-thumbs-down');
    }

    if (buttonData.type === this._prefix + 'volume-low') {
      this.sendCommandValue('player-set-volume', 2);
      setTimeout(() => {
        fetch(this._apiUrl + '/query/player').then(res => res.json()).then(res => {
          FreedeckAPI.pushNotification('Volume: ' + res.volumePercent + '%');
        });
      }, 35);
    }

    return { type: 'none', data: [buttonData] };
  }

  registerAllButtons () {
    this.registerNewType('YTMD Play/Pause', this._prefix + 'play');
    this.registerNewType('YTMD Now Playing', this._prefix + 'now-playing');
    this.registerNewType('YTMD Volume +', this._prefix + 'volume-up');
    this.registerNewType('YTMD Volume -', this._prefix + 'volume-down');
    this.registerNewType('YTMD Low Volume', this._prefix + 'volume-low');
    this.registerNewType('YTMD Next', this._prefix + 'next');
    this.registerNewType('YTMD Previous', this._prefix + 'previous');
    this.registerNewType('YTMD Thumbs Up', this._prefix + 'thumbs-up');
    this.registerNewType('YTMD Thumbs Down', this._prefix + 'thumbs-down');
  }

  onInitialize (data) {
    this._prefix = 'roi.ytmd-controller.';
    this._apiUrl = 'http://192.168.5.69:9863';

    try {
      this.requestFromAPI('player').then(() => {
        console.log('YouTube Music Desktop is running!');
      }).catch(() => {
        console.log('YouTube Music Desktop is not currently running!');
      });
    } catch (err) {
      console.log(err);
    }
    this.registerAllButtons();

    setInterval(() => this.newPlayerData(), 25);

    return true;
  }

  checkNewSong () {
    if (this._songData.title === this._lastSongData.title) { /* empty */ } else {
      FreedeckAPI.pushNotification('Now listening to: ' + this._songData.title + ' by ' + this._songData.author);
    }
  }

  newPlayerData () {
    return new Promise((resolve, reject) => {
      this.requestFromAPI('player').then(playerDat => {
        this._playerData = playerDat;
        this.requestFromAPI('track').then(trackDat => {
          this._lastSongData = this._songData;
          this._songData = trackDat;
          this.checkNewSong();
          resolve(this._playerData);
        });
      });
    });
  }

  requestFromAPI (path) {
    return new Promise((resolve, reject) => {
      fetch(this._apiUrl + '/query/' + path).then(res => res.json()).then(res => {
        resolve(res);
      }).catch(failure => reject);
    });
  }

  sendCommand (data) {
    return new Promise((resolve, reject) => {
      fetch(this._apiUrl + '/query', {
        method: 'post',
        body: JSON.stringify({
          command: data
        })
      }).then(res => res.json()).then(res => {
        resolve(res);
      }).catch(failure => reject);
    });
  }

  sendCommandValue (data, val) {
    return new Promise((resolve, reject) => {
      fetch(this._apiUrl + '/query', {
        method: 'post',
        body: JSON.stringify({
          command: data,
          value: val
        })
      }).then(res => res.json()).then(res => {
        resolve(res);
      }).catch(failure => reject);
    });
  }
}
