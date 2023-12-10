universal.listenFor('notif', (dat) => {
	const login = document.createElement('li');
		login.id = 'constat'
		login.style.fontSize= '.75em';
		login.setHTML('<a href="#">Connected!</a>');
		document.querySelector('#sidebar > ul').appendChild(login);
})

/**
 * <div id="sidebar">
    <ul>
        <li><strong>Freedeck</strong></li>
        <li><a href="index.html">Home</a></li>
        <li><a href="plugins.html">Plugins</a></li>
        <li><a href="#">Settings</a></li>
    </ul>
</div>
 */
const sidebar = [
	{'Home': 'index.html'},
	{'Plugins': 'plugins.html'},
	{'Settings': 'settings.html'}
]

const _sidebar_ele = document.createElement('div');
_sidebar_ele.id = 'sidebar';
const _sidebar_ul = document.createElement('ul');
_sidebar_ele.appendChild(_sidebar_ul)
_sidebar_ul.setHTML('<li style="font-size: .65em; background: none; margin: 0 auto;"><h2>Freedeck</h2></li>')
sidebar.forEach(itm => {
	let name = Object.keys(itm)[0];
	let val = itm[name];
	let ele = document.createElement('li');
	ele.setAttribute('hovereffect', 'yes')
	ele.setHTML(`<a href="${val}">${name}</a>`);
	_sidebar_ul.appendChild(ele)
})

document.body.appendChild(_sidebar_ele)