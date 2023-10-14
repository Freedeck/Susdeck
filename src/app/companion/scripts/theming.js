/* eslint-disable no-undef, no-unused-vars */

const thc = document.querySelector('#themechoices');
Object.keys(universal.themes).forEach(key => {
  const newbutton = document.createElement('button');
  newbutton.className = 'tc';
  newbutton.onclick = () => {
    universal.setTheme(key);
  };
  newbutton.innerText = key;
  thc.appendChild(newbutton);
});
