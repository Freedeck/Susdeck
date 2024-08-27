universal.on('oc_cs', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'obs.cs') {
      btn.innerText = data;
    }
    if (inter.type.startsWith('obs.ss')) {
      let scene = inter.type.split('obs.ss.')[1];
      if (!btn.querySelector('#oc_indi')) {
        let indicator = document.createElement('div');
        indicator.id = 'oc_indi';
        btn.appendChild(indicator);
      }
      if (data == scene) {
        btn.querySelector('#oc_indi').classList.add('indicator-green');
      } else {
        btn.querySelector('#oc_indi').classList.remove('indicator-green');
      }
    }
  })
})

universal.on('oc_vo', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'obs.v.' + data.uuid) {
      btn.querySelector('.slider-container').dataset.value = Math.round(data.inputVolumeDb);
    }
  })
});

universal.on('oc_rec', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'obs.rec.start' || inter.type == 'obs.rec.stop' || inter.type == 'obs.rec.toggle') {
      if (data.outputActive && !data.outputPaused) {
        if (!btn.querySelector('#oc_indi')) {
          let indicator = document.createElement('div');
          indicator.id = 'oc_indi';
          btn.appendChild(indicator);
        }
        btn.querySelector('#oc_indi').classList.add('indicator-red');
        btn.querySelector('#oc_indi').classList.remove('indicator-green');
      } else {
        btn.querySelector('#oc_indi').classList.remove('indicator-red');
        btn.querySelector('#oc_indi').classList.add('indicator-green');
        if (data.outputPaused) {
          btn.querySelector('#oc_indi').classList.add('indicator-yellow');
          btn.querySelector('#oc_indi').classList.remove('indicator-green');
        }
      }
    }

    if (inter.type == 'obs.rec.toggle_pause') {
      if (!data.outputActive) {
        console.log('pased')
        if (!btn.querySelector('#oc_indi')) {
          let indicator = document.createElement('div');
          indicator.id = 'oc_indi';
          btn.appendChild(indicator);
        }
        btn.querySelector('#oc_indi').classList.add('indicator-yellow');
        btn.querySelector('#oc_indi').classList.remove('indicator-green');
      } else {
        btn.querySelector('#oc_indi').classList.remove('indicator-yellow');
        btn.querySelector('#oc_indi').classList.add('indicator-green');
      }
    }
  })
})

universal.on('oc_str', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'obs.str.start' || inter.type == 'obs.str.stop' || inter.type == 'obs.str.toggle') {
      if (data.outputActive) {
        if (!btn.querySelector('#oc_indi')) {
          let indicator = document.createElement('div');
          indicator.id = 'oc_indi';
          btn.appendChild(indicator);
        }
        btn.querySelector('#oc_indi').classList.remove('indicator-green');
        btn.querySelector('#oc_indi').classList.add('indicator-red');
      } else {
        btn.querySelector('#oc_indi').classList.remove('indicator-red');
        btn.querySelector('#oc_indi').classList.add('indicator-green');
      }
    }
  })
})

universal.on('oc_rb', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'obs.rb.start' || inter.type == 'obs.rb.stop' || inter.type == 'obs.rb.toggle') {
      if (data.outputActive) {
        if (!btn.querySelector('#oc_indi')) {
          let indicator = document.createElement('div');
          indicator.id = 'oc_indi';
          btn.appendChild(indicator);
        }
        btn.querySelector('#oc_indi').classList.remove('indicator-green');
        btn.querySelector('#oc_indi').classList.add('indicator-red');
      } else {
        btn.querySelector('#oc_indi').classList.remove('indicator-red');
        btn.querySelector('#oc_indi').classList.add('indicator-green');
      }
    }
  })
});

universal.on('oc_ms', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'obs.m.' + data.uuid) {
      if (data.inputMuted) {
        if (!btn.querySelector('#oc_indi')) {
          let indicator = document.createElement('div');
          indicator.id = 'oc_indi';
          btn.appendChild(indicator);
        }
        btn.querySelector('#oc_indi').classList.remove('indicator-green');
        btn.querySelector('#oc_indi').classList.add('indicator-red');
      } else {
        btn.querySelector('#oc_indi').classList.remove('indicator-red');
        btn.querySelector('#oc_indi').classList.add('indicator-green');
      }
    }
  });
});

universal.on('oc_src_vis', (data) => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter == null) return;

    if (inter.type == 'obs.src.vis' && inter.data.Source == data.sourceName) {
      if (data.sceneItemEnabled) {
        if (!btn.querySelector('#oc_indi')) {
          let indicator = document.createElement('div');
          indicator.id = 'oc_indi';
          btn.appendChild(indicator);
        }
        btn.querySelector('#oc_indi').classList.remove('indicator-red');
        btn.querySelector('#oc_indi').classList.add('indicator-green');
      } else {
        btn.querySelector('#oc_indi').classList.remove('indicator-green');
        btn.querySelector('#oc_indi').classList.add('indicator-red');
      }
    }
  });
});

const obsc_handlePageChange = () => {
  document.querySelectorAll('.button').forEach((btn) => {
    let inter = JSON.parse(btn.getAttribute('data-interaction'));
    if (inter != null) {
      if (inter.type.startsWith('obs.ss') || inter.type == 'obs.cs') {
        universal.send('oc_cs');
      }
      if (inter.type.startsWith('obs.v.')) {
        let uuid = inter.type.split('obs.v.')[1];
        universal.send('oc_vo', {
          name: inter.data.name,
          uuid: uuid
        });
      }
      if (inter.type.startsWith('obs.rec.')) {
        let indicator = document.createElement('div');
        indicator.id = 'oc_indi';
        universal.send('oc_rec');
        btn.appendChild(indicator);
      }
      if (inter.type.startsWith('obs.str.')) {
        let indicator = document.createElement('div');
        indicator.id = 'oc_indi';
        universal.send('oc_str');
        btn.appendChild(indicator);
      }
      if (inter.type.startsWith('obs.rb.')) {
        let indicator = document.createElement('div');
        indicator.id = 'oc_indi';
        universal.send('oc_rb');
        btn.appendChild(indicator);
      }
      if (inter.type.startsWith('obs.m.')) {
        let indicator = document.createElement('div');
        indicator.id = 'oc_indi';
        universal.send('oc_ms', {
          name: inter.data.name,
          uuid: inter.type.split('obs.m.')[1]
        });
        btn.appendChild(indicator);
      }
      if (inter.type == 'obs.src.vis') {
        let indicator = document.createElement('div');
        indicator.id = 'oc_indi';
        universal.send('oc_src_vis', {
          Scene: inter.data.Scene,
          Source: inter.data.Source,
        });
        btn.appendChild(indicator);
      }
    }
  })
};

obsc_handlePageChange();

universal.listenFor('page_change', () => {
  obsc_handlePageChange();
})