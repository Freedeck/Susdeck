universal.on('yvo', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'ytmd.slider.vol') {
      let sl = btn.querySelector('.slider-container');
      if(sl.dataset.dragging != 'true') sl.dataset.value = data;
    }
  })
})

setInterval(() => {
  universal.send('yvo');
}, 1500);