const onUpdate = (evt) => {
  const item = evt.item;
  let nidx = evt.newIndex;
  let oidx = evt.oldDraggableIndex;

  if (universal.load('page') === 0) {

  } else {
    let pagefinder = universal.load('page');
    if (item.page) pagefinder = item.page;
    oidx = pagefinder * universal.iconCount + evt.oldDraggableIndex;
    nidx = pagefinder * universal.iconCount + evt.newIndex;
  }
  const name = item.innerText;
  const uuid = item.getAttribute('data-uuid');
  universal.socket.emit('fd.companion.sort', { name, uuid, nidx, oidx });
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
  const cop = (universal.load('page') * universal.iconCount) + universal.iconCount;
  const lnp = cop + 4;
  // console.log(found, idx, lnp)
  // universal.socket.emit('fd.companion.sort', { name: found.name, uuid: found.uuid, nidx: lnp, oidx: idx });

  universal.socket.emit('fd.companion.info-change', JSON.stringify({
    type: 'key_edit',
    uuid,
    oldIcon: '',
    icon: null,
    key: 'null',
    keysArr: [],
    ogValues: [],
    oldpath: null,
    newpath: '',
    newname: name,
    name,
    page: universal.load('page'),
    newPage: Number(universal.load('page')) + 1
  }));

  universal.socket.emit('fd.companion.change');
};

const sortBP = (name, uuid) => {
  const found = Sounds.find(thing => thing.uuid === uuid);
  const idx = Sounds.indexOf(found);
  const lnp = Math.abs((universal.load('page') * universal.iconCount) - idx);
  universal.socket.emit('fd.companion.info-change', JSON.stringify({
    type: 'key_edit',
    uuid,
    oldIcon: '',
    icon: null,
    key: 'null',
    keysArr: [],
    ogValues: [],
    oldpath: null,
    newpath: '',
    newname: name,
    name,
    page: universal.load('page'),
    newPage: Number(universal.load('page')) - 1
  }));
  universal.socket.emit('fd.companion.change');
};
