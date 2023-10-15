/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
let keyList = [];
let loaded = false;
let userAlive = true;
let currentPage = universal.load('page') ? universal.load('page') : 0;

universal.remove('hidden');

universal.socket.on('server_connected', (loginStatus) => {
  if (!loginStatus) {
    loaded = true;
    universal.socket.emit('Authenticated', universal.createTempHWID());

    if (!universal.load('welcomed')) {
      universal.sendToast('Welcome to Freedeck! Press any button to play a sound on your computer!');
      universal.save('welcomed', true);
    }
  } else {
    if (universal.load('session')) { // If _sdsession exists login
      universal.socket.emit('Authenticated', universal.load('session'));
    } else {
      universal.sendToast('Not logged in, requesting login');
      loaded = true;
      universal.save('temp_hwid', universal.createTempHWID()); // Create a temporary session ID for logging in
      universal.socket.emit('fd.c2s.login.request', universal.load('temp_hwid')); // Request login form with session ID
    }
  }
});

universal.socket.on('fd.c2s.login.request_accepted', (nextLoc, loginMsg, ownerName) => { // When we get the green light to login
  loaded = true; // Keep page from reloading
  universal.sendToast('Request received by server, let\'s log in.');
  universal.save('login_msg', loginMsg);
  universal.save('owner_name', ownerName); // Save the login message and owner's name
  window.location.href = nextLoc; // Next, move the page over to login page that server sends back
});

// The server has authenticated you therefore we can bypass login
universal.socket.on('session_valid', () => {
  loadPage();
  document.querySelector('#keys').style.display = 'grid';
  universal.validSession();
});

setInterval(() => {
  // Auto refresh, you shouldn't be waiting to connect for longer than 500ms.
  if (loaded) return;
  universal.sendToast('Connection attempt timed out. Retrying...');
  window.location.reload();
}, 1500);

document.addEventListener('click', () => { // Basically, turn the screensaver on
  if (userAlive === false) keys.style.opacity = '1';
  screensaverStatus = false;
  userAlive = true;
});

const loadPage = (pageNumber = currentPage) => { // Setup the Freedeck page w/ sound buttons
  pageNumber = Number(pageNumber);
  currentPage = pageNumber;
  universal.save('page', currentPage); // Persistent page saving
  keyList = [];
  if (document.querySelector('#keys')) document.querySelector('#keys').remove();
  const keys = document.createElement('div');
  keys.id = 'keys';
  while (keys.firstChild) {
    keys.removeChild(keys.lastChild); // Remove everything from the previous keys
  }
  if (!Pages[currentPage]) {
    loadPage(0);
    return;
  }
  // eslint-disable-next-line no-undef
  Pages[currentPage].forEach(sound => { // For each sound in the page create a button
    keyList.push(sound);
    const btn = document.createElement('button');
    btn.className = 'keypress white-txt';
    btn.setAttribute('data-interaction', JSON.stringify(sound));
    if (sound.keys) {
      btn.setAttribute('data-multi', true);
      btn.setAttribute('data-keys', sound.keys);
    }
    if (sound.icon) {
      btn.style.backgroundImage = "url('assets/icons/" + sound.icon + "')";
    }
    btn.innerText = sound.name;
    if (sound.name === '_fd_spacer') {
      btn.className += ' spacer';
      btn.innerText = '';
    }
    keys.appendChild(btn);
  });

  // Utility buttons
  const utils = [
    {
      name: 'Stop All',
      onclick: () => {
        universal.socket.emit('keypress', {
          macro: false,
          name: 'Stop All'
        });
      },
      interaction: {
        name: 'Stop All'
      }
    },
    {
      name: 'Reload',
      onclick: () => {
        window.location.reload();
      },
      interaction: {
        name: 'Reload'
      }
    },
    {
      id: 'freedeck'
    }
  ];
  utils.forEach((util) => {
    if (util.id === 'freedeck') {
      const freedeck = document.createElement('a');
      freedeck.className = 'button';
      freedeck.style.backgroundImage = "url('assets/icons/freedeck.png')";
      freedeck.style.backgroundSize = 'contain';
      freedeck.onclick = () => {
        document.querySelector('#settings').style.display = 'block';
        document.querySelector('#settings').style.animationName = 'size-up-init';
        document.querySelector('#keys').style.animationName = 'size-down';
        fard();
        document.querySelector('#keys').style.display = 'none';
        universal.save('hidden', true);
      };
      keys.appendChild(freedeck);
      return;
    }
    const tempButton = document.createElement('button');
    tempButton.className = 'keypress white-txt';
    tempButton.innerText = util.name;
    if (util.interaction) tempButton.setAttribute('data-interaction', JSON.stringify(util.interaction));
    tempButton.onclick = util.onclick;
    keys.appendChild(tempButton);
  });

  document.body.appendChild(keys);

  // Setup the button press functions
  const allKeypress = document.getElementsByClassName('keypress');
  for (let i = 0; i < allKeypress.length; i++) {
    allKeypress[i].onmouseup = (ev) => {
      // eslint-disable-next-line no-undef
      universal.socket.emit('keypress', allKeypress[i].getAttribute('data-interaction'));
    };
  }

  if (universal.load('hidden')) {
    document.querySelector('#keys').style.display = 'none';
  }
};

/* eslint-disable no-undef */
let touchstartX = 0;
let touchendX = 2500;

const checkDirection = () => {
  const range = touchendX - touchstartX;
  if (range < -50) {
    // go page up
    if (Pages[currentPage + 1]) {
      loadPage(currentPage + 1);
    } else {
      /* empty */
    }
  }
  if (range > 50) {
    // go page down
    if (Pages[currentPage - 1]) {
      loadPage(currentPage - 1);
    } else {
      /* empty */
    }
  }
};

document.addEventListener('touchmove', (event) => {
  event.preventDefault();
});

document.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX;
  checkDirection();
});

const tc = document.querySelector('#themechoices');
Object.keys(universal.themes).forEach(key => {
  const newButton = document.createElement('button');
  newButton.className = 'keypress white-txt tc';
  newButton.onclick = () => {
    universal.setTheme(key);
  };
  newButton.innerText = key;
  tc.appendChild(newButton);
});

const fard = () => {
};
