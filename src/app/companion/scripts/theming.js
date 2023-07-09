/* eslint-disable no-undef, no-unused-vars */

const tc = document.querySelector('#themechoices');
Object.keys(universal.themes).forEach(key => {
  const newbutton = document.createElement('button');
  newbutton.onclick = () => {
    universal.setTheme(key);
  };
  newbutton.innerText = key + ' Theme';
  tc.appendChild(newbutton);
});
