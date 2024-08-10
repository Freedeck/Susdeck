const updateKeys = (data) => {
  let formatted = {};
  data.forEach((el) => {
    formatted[el.name] = [el.friendly, el.volume];
  });
  document.querySelectorAll('.button').forEach((el) => {
    if(!el.getAttribute('data-interaction')) return;
    let interact = el.getAttribute('data-interaction');
    interact = JSON.parse(interact);
    if (interact.data && interact.data.app && formatted[interact.data.app]) {
      interact.data.value = formatted[interact.data.app][1] * 100;
      el.setAttribute('data-interaction', JSON.stringify(interact));
      el.querySelector('.slider-container').dataset.value = formatted[interact.data.app][1] * 100;
    }
  })
}

export function grabAndHandle() {
  fetch('/native/volume/apps').then((res) => res.json()).then(a => {
    updateKeys(a);
  }).catch((err) => {
  
  });
}

export function generic() {
  grabAndHandle();
  grabAndHandle();
  setInterval(() => {
    grabAndHandle();
  }, 1000);
}

export function handler() {
  universal.on(universal.events.companion.native_keypress, (data) => {
    data = JSON.parse(data);
    if (data.type == 'fd.sys.volume') {
      let padded = data.data.value.length === 1 ? '00' + data.data.value : data.data.value.length === 2 ? '0' + data.data.value : data.data.value;
      fetch('/native/volume/app/' + padded + '/' + data.data.app).then((res) => res.json()).then(a => {
        console.log(a)
      }).catch((err) => {
        console.log('Error while fetching app volume', err);
      });
    } else if(data.type == 'fd.sys.volume.sys') {
      let padded = data.data.value.length === 1 ? '00' + data.data.value : data.data.value.length === 2 ? '0' + data.data.value : data.data.value;
      fetch('/native/volume/sys/' + padded).then((res) => res.json()).then(a => {
        console.log(a)
      }).catch((err) => {
        console.log('Error while fetching system volume', err);
      })
    }
  })

  universal.on(universal.events.keypress, (data) => {
    data = JSON.parse(data);
    if (data.type == 'fd.profile') {
      universal.page = 0;
      universal.save('page', universal.page);
      universal.send(universal.events.companion.set_profile, data.data.profile);
    }
  })
}