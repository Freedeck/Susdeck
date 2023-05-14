/* eslint-disable no-undef, no-unused-vars */
function setTheme (t) {
  susdeckUniversal.save('theme', t);
  susdeckUniversal.socket.emit('c-theme', t);
  setTimeout(() => {
    susdeckUniversal.socket.emit('c-change');
  }, 200);
}

const tc = document.getElementById('themechoices');
Object.keys(susdeckUniversal.themes).forEach(key => {
  const newbutton = document.createElement('button');
  newbutton.onclick = () => {
    setTheme(key);
  };
  newbutton.innerText = key + ' Theme';
  tc.appendChild(newbutton);
});
