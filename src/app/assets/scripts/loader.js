/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
const keys = document.getElementById('keys');
let keyList = [];
let loaded = false;
let userAlive = true;
let currentPage = 0;

addToHTMLlog('Waiting for host...');

susdeckUniversal.socket.on('server_connected', function () {
  addToHTMLlog('Connected! Checking for login status..');
  if (susdeckUniversal.load('session')) { // If _sdsession exists login
    susdeckUniversal.socket.emit('Authenticated', susdeckUniversal.load('session'));
    addToHTMLlog('Success! You\'re logged in.');
    loaded = true; // Keep page from reloading
  } else {
    addToHTMLlog('Not logged in, requesting login');
    loaded = true;
    susdeckUniversal.save('sid', susdeckUniversal.createTempHWID()); // Create a temporary session ID for logging in
    susdeckUniversal.socket.emit('c2sr_login', susdeckUniversal.load('sid')); // Request login form with session ID
  }
});

susdeckUniversal.socket.on('s2ca_login', function (nextLoc, loginMsg, ownerName) { // When we get the green light to login
  addToHTMLlog('Request received by server, let\'s log in.');
  susdeckUniversal.save('login_msg', loginMsg);
  susdeckUniversal.save('owner_name', ownerName); // Save the login message and owner's name
  window.location.href = nextLoc; // Next, move the page over to login page that server sends back
});

// The server has authenticated you therefore we can bypass login
susdeckUniversal.socket.on('session_valid', function () {
  document.getElementById('loading').style.display = 'none';
  loadPage(0);
});

susdeckUniversal.socket.on('banish', function () { // The server has restarted, and your session is invalid
  localStorage.setItem('_sdsession', '');
  document.getElementById('keys').remove();
  document.getElementById('loading').style.display = 'block';
  document.getElementById('loading').innerHTML = `<h1>Susdeck</h1>
  <p>Your session expired, please login again.</p>
  <button onclick="localStorage.setItem('_sdsession',''); window.location.replace(window.location.href)">Login</button>`;
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

function loadPage (pageNumber) { // Setup the Susdeck page w/ sound buttons
  currentPage = pageNumber;
  susdeckUniversal.save('page', currentPage); // Persistent page saving
  keyList = [];
  const keysNode = document.getElementById('keys');
  while (keysNode.firstChild) {
    keysNode.removeChild(keysNode.lastChild); // Remove everything from the previous keys
  }
  // eslint-disable-next-line no-undef
  Pages[pageNumber].forEach(sound => { // For each sound in the page create a button
    keyList.push(sound);
    const btn = document.createElement('button');
    btn.className = 'keypress btxt';
    if (sound.keys) {
      btn.setAttribute('data-multi', true);
      btn.setAttribute('data-key', sound.keys);
    }
    if (sound.key) {
      btn.setAttribute('data-key', sound.key);
    }
    if (sound.icon) {
      btn.style.backgroundImage = "url('assets/icons/" + sound.icon + "')";
    }
    btn.innerText = sound.name;
    keys.appendChild(btn);
  });

  // Utility buttons
  const stopall = document.createElement('button');
  stopall.className = 'keypress btxt';
  stopall.innerText = 'Stop All';
  const reloadbtn = document.createElement('button');
  reloadbtn.onclick = () => {
    window.location.reload();
  };
  reloadbtn.className = 'btxt';
  reloadbtn.innerText = 'Reload';
  const susdeck = document.createElement('a');
  susdeck.className = 'button';
  susdeck.style.backgroundImage = "url('assets/icons/susdeck.png')";
  keys.appendChild(stopall);
  keys.appendChild(reloadbtn);
  keys.appendChild(susdeck);

  // Setup the button press functions
  const allKeypress = document.getElementsByClassName('keypress');
  for (let i = 0; i < allKeypress.length; i++) {
    allKeypress[i].onmouseup = (ev) => {
      // eslint-disable-next-line no-undef
      if (SoundOnPress) new Audio('assets/sounds/press.mp3').play();
      if (allKeypress[i].getAttribute('data-key')) {
        susdeckUniversal.socket.emit('keypress', {
          macro: true,
          keys: allKeypress[i].getAttribute('data-key')
        });
      } else {
        susdeckUniversal.socket.emit('keypress', {
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
