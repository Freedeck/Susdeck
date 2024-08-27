const handle = () => {
	document.querySelectorAll('.button').forEach((button) => {
		if (button.getAttribute('data-interaction')) {
			let dat = button.getAttribute('data-interaction');
			dat = JSON.parse(dat);
			if(button.id == 'editor-btn') return;
			if (dat.type == 'clock.time') {
				let txt = button.querySelector('.button-text').querySelector('p');
				txt.innerText = new Date(Date.now()).toLocaleTimeString();
			} else if (dat.type == 'clock.date') {
				let txt = button.querySelector('.button-text').querySelector('p');
				txt.innerText = new Date(Date.now()).toLocaleDateString();
			} else if (dat.type == 'clock.time.24') {
				let txt = button.querySelector('.button-text').querySelector('p');
				txt.innerText = new Date(Date.now()).toLocaleTimeString('en-US', { hour12: false });
			}
		}
	});
};
handle();
universal.listenFor('page_change', () => {
	handle();
})
setInterval(() => {
	handle();
}, 1000)