
const onEnd = (evt) => {
  console.log(evt);
  // newDraggableIndex
  // oldDraggableIndex

};

new Sortable(document.querySelector('#keys'), {
  onEnd
});
