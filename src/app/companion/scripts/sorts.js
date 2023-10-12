
const onUpdate = (evt) => {
  const item = evt.item;
  const nidx = evt.newIndex;
  const oidx = evt.oldDraggableIndex;

  const name = item.innerText;
  const uuid = item.getAttribute('data-uuid');

  universal.socket.emit('c-sort', { name, uuid, nidx, oidx });
};

new Sortable(document.querySelector('#keys'), {
  onUpdate,
  filter: '.sortignore'
});

const sortNP = (name, uuid) => {
  console.log('move next ', name, uuid);
  let found = Sounds.find(thing => thing.uuid === uuid);
  let idx = Sounds.indexOf(found);
  console.log(idx, universal.iconCount - idx, Sounds.at(universal.iconCount - idx));
}
