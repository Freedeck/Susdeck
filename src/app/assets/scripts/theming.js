/* eslint-disable no-undef */
// eslint-disable-next-line no-undef

const tc = document.getElementById('themechoices');
Object.keys(universal.themes).forEach(key => {
  const newButton = document.createElement('button');
  newButton.className = 'keypress white-txt';
  newButton.onclick = () => {
    universal.setTheme(key);
  };
  newButton.innerText = key + ' Theme';
  tc.appendChild(newButton);
});

let loaded = false;

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
  loaded = true; // Keep page from reloading
  document.getElementById('loading').style.display = 'none';

  if (!universal.load('welcomed_ob')) {
    universal.sendToast('Welcome to Freedeck\'s onboard settings!');
    universal.save('welcomed_ob', true);
  }
});

universal.socket.on('session_invalid', function () { // The server has restarted, and your session is invalid
  localStorage.setItem('_sdsession', '');
  document.getElementById('loading').style.display = 'block';
  document.getElementById('loading').innerHTML = `<h1>Freedeck</h1>
  <p>Your session expired - We're trying to log you back in.</p>
  <button onclick="localStorage.setItem('_sdsession',''); window.location.replace(window.location.href)">Reset Session</button>
  <div id='console'></div>`;
  universal.save('sid', universal.createTempHWID()); // Create a temporary session ID for logging in
  universal.socket.emit('c2sr_login', universal.load('sid')); // Request login form with session ID
});

setInterval(function () {
  // Auto refresh, you shouldn't be waiting to connect for longer than 500ms.
  if (loaded) return;
  addToHTMLlog('Connection attempt timed out. Retrying...');
  window.location.reload();
}, 1500);
