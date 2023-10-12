
const onUpdate = (evt) => {
  console.log('evt')
  universal.socket.emit('c-sort', JSON.stringify(evt));
};

new Sortable(document.querySelector('#keys'), {
  onUpdate
});
