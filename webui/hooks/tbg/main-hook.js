let style = document.createElement('link');
style.rel = 'stylesheet';
style.href = '/hooks/tbg/_tbg.css'
document.head.appendChild(style);
let a = document.createElement('p');
a.classList.add('_tbg_main');
document.body.appendChild(a);
universal.on('_t', (e) => {
	a.innerText = e;
});

universal.send('Request text')