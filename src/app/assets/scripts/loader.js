/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
let keyList = [];
let loaded = false;
let userAlive = true;
let currentPage = 0;

addToHTMLlog('Waiting for host...');

universal.socket.on('server_connected', function () {
  addToHTMLlog('Connected! Checking for login status..');
  if (universal.load('session')) { // If _sdsession exists login
    universal.socket.emit('Authenticated', universal.load('session'));
    addToHTMLlog('Sending server session ID..');
  } else {
    addToHTMLlog('Not logged in, requesting login');
    loaded = true;
    universal.save('sid', universal.createTempHWID()); // Create a temporary session ID for logging in
    universal.socket.emit('c2sr_login', universal.load('sid')); // Request login form with session ID
  }
});

universal.socket.on('s2ca_login', function (nextLoc, loginMsg, ownerName) { // When we get the green light to login
  loaded = true; // Keep page from reloading
  addToHTMLlog('Request received by server, let\'s log in.');
  universal.save('login_msg', loginMsg);
  universal.save('owner_name', ownerName); // Save the login message and owner's name
  window.location.href = nextLoc; // Next, move the page over to login page that server sends back
});

// The server has authenticated you therefore we can bypass login
universal.socket.on('session_valid', function () {
  loadPage(0);

  if (!universal.load('welcomed')) {
    universal.sendToast('Welcome to Freedeck! Press any button to play a sound on your computer!');
    universal.save('welcomed', true);
  }
});

setInterval(function () {
  // Auto refresh, you shouldn't be waiting to connect for longer than 500ms.
  if (loaded) return;
  addToHTMLlog('Connection attempt timed out. Retrying...');
  window.location.reload();
}, 1500);

document.addEventListener('click', () => { // Basically, turn the screensaver on
  if (userAlive === false) keys.style.opacity = '1';
  screensaverStatus = false;
  userAlive = true;
});

function loadPage (pageNumber) { // Setup the Freedeck page w/ sound buttons
  currentPage = pageNumber;
  universal.save('page', currentPage); // Persistent page saving
  keyList = [];
  if (document.getElementById('keys')) document.getElementById('keys').remove();
  const keys = document.createElement('div');
  keys.id = 'keys';
  while (keys.firstChild) {
    keys.removeChild(keys.lastChild); // Remove everything from the previous keys
  }
  // eslint-disable-next-line no-undef
  Pages[pageNumber].forEach(sound => { // For each sound in the page create a button
    keyList.push(sound);
    const btn = document.createElement('button');
    btn.className = 'keypress white-txt';
    if (sound.keys) {
      btn.setAttribute('data-multi', true);
      btn.setAttribute('data-keys', sound.keys);
    }
    if (sound.icon) {
      btn.style.backgroundImage = "url('assets/icons/" + sound.icon + "')";
    }
    btn.innerText = sound.name;
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
      }
    },
    {
      name: 'Reload',
      onclick: () => {
        window.location.reload();
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
      freedeck.href = 'theme.html';
      keys.appendChild(freedeck);
      return;
    }
    const tempButton = document.createElement('button');
    tempButton.className = 'keypress white-txt';
    tempButton.innerText = util.name;
    tempButton.onclick = util.onclick;
    keys.appendChild(tempButton);
  });

  document.body.appendChild(keys);

  // Setup the button press functions
  const allKeypress = document.getElementsByClassName('keypress');
  for (let i = 0; i < allKeypress.length; i++) {
    allKeypress[i].onmouseup = (ev) => {
      // eslint-disable-next-line no-undef
      if (SoundOnPress) new Audio('assets/sounds/press.mp3').play(); // This slows down Freedeck for some reason. Not sure why
      if (allKeypress[i].getAttribute('data-keys')) {
        universal.socket.emit('keypress', {
          macro: true,
          keys: allKeypress[i].getAttribute('data-keys')
        });
      } else {
        universal.socket.emit('keypress', {
          macro: false,
          name: allKeypress[i].innerHTML
        });
      }
    };
  }
}

/* eslint-disable no-undef */
let touchstartX = 0;
let touchendX = 2500;

function checkDirection () {
  if (touchendX < touchstartX) {
    // go page up
    if (Pages[currentPage + 1]) {
      loadPage(currentPage + 1);
    } else {
      /* empty */ }
  }
  if (touchendX > touchstartX) {
    // go page down
    if (Pages[currentPage - 1]) {
      loadPage(currentPage - 1);
    } else {
      /* empty */ }
  }
}

document.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX;
  checkDirection();
});
