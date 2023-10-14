const onUpdate = (evt) => {
  const item = evt.item;
  let nidx = evt.newIndex;
  let oidx = evt.oldDraggableIndex;

  if(universal.load('page') === 0) {

  } else {
    oidx = (universal.load('page') * universal.iconCount) + evt.oldDraggableIndex + 1;
    nidx = (universal.load('page') * universal.iconCount) + evt.newIndex + 1;
  }
  const name = item.innerText;
  const uuid = item.getAttribute('data-uuid');
  universal.socket.emit('c-sort', { name, uuid, nidx, oidx });
  universal.reloadAllButThisClient();
};

const arrayMove = (arr, oldIndex, newIndex) => {
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  return arr; // for testing
};

new Sortable(document.querySelector('#keys'), {
  onUpdate,
  filter: '.sortignore',
  preventOnFilter: true
});

const sortNP = (name, uuid) => {
  const found = Sounds.find(thing => thing.uuid === uuid);
  const idx = Sounds.indexOf(found);
  const lnp = universal.iconCount + idx;
  universal.socket.emit('c-sort', { name: found.name, uuid: found.uuid, nidx: lnp, oidx: idx });
  universal.socket.emit('c-change');
};

const sortBP = (name, uuid) => {
  const found = Sounds.find(thing => thing.uuid === uuid);
  const idx = Sounds.indexOf(found);
  const lnp = Math.abs(idx - universal.iconCount);
  universal.socket.emit('c-sort', { name: found.name, uuid: found.uuid, nidx: lnp, oidx: idx });
  universal.socket.emit('c-change');
};
