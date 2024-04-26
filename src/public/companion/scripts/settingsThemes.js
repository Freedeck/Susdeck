
Object.keys(universal.themes).forEach((id) => {
  const theme = universal.themes[id];
  const element = document.createElement('div');
  element.className = 'theme';
  const title = document.createElement('h2');
  title.innerText = theme.name;
  element.appendChild(title);
  const desc = document.createElement('h3');
  desc.innerText = theme.description;
  const apply = document.createElement('button');
  apply.innerText = 'Apply';
  apply.onclick = () => {
    universal.send(universal.events.companion.set_theme, id);
    window.location.reload();
  };
  if (universal.load('theme') == id) {
    title.innerText += ' (Active)';
    apply.disabled = true;
    apply.style.backgroundColor = 'rgba(0, 0, 0, 0.125)';
    apply.innerText = 'In Use';
  }
  element.appendChild(desc);
  element.appendChild(apply);
  document.querySelector('.themelist').appendChild(element);
});
