/* eslint-disable no-undef, no-unused-vars */
function setTheme (t) {
  universal.save('theme', t);
  universal.socket.emit('c-theme', t);
  setTimeout(() => {
    universal.socket.emit('c-change');
  }, 200);
}

const tc = document.getElementById('themechoices');
Object.keys(universal.themes).forEach(key => {
  const newbutton = document.createElement('button');
  newbutton.onclick = () => {
    setTheme(key);
  };
  newbutton.innerText = key + ' Theme';
  tc.appendChild(newbutton);
});
