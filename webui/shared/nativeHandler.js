const updateKeys = (data) => {
	const formatted = {};
	for (const el of data) {
		// {name: 'app', friendly: 'App Name', volume: 0.5}
		formatted[el.name] = [el.friendly, el.volume];
	}
	for (const el of document.querySelectorAll(".button")) {
		if (!el.getAttribute("data-interaction")) continue;
		if (el.id === "editor-btn") continue;
		let interact = el.getAttribute("data-interaction");
		interact = JSON.parse(interact);
		if (interact.data.app && formatted[interact.data.app]) {
			interact.data.value = formatted[interact.data.app][1] * 100;
			el.setAttribute("data-interaction", JSON.stringify(interact));
			el.querySelector(".slider-container").dataset.value =
				formatted[interact.data.app][1] * 100;
		}
	}
};

export function grabAndHandle() {
	if(universal.nbws)
	universal.nbws.send("get_apps", "");
}

const nbws = {
	cache: [],
	send: (data, ...args) => {
		universal.send(universal.events.nbws.request, [data, args]);
	},
	on: (event, callback) => {
		universal.send(universal.events.nbws.reply, event);
		universal.on(universal.events.nbws.reply, (data) => {
			if(data[0] === event) {
				callback(data[1]);
			}
		});
	},
	once: (event, callback) => {
		universal.send(universal.events.nbws.replyOnce, event);
		universal.on(universal.events.nbws.replyOnce, (data) => {
			if(data[0] === event) {
				callback(data[1]);
			}
		});
	},
	setVolume: (app, volume) => {
		nbws.send("set_volume", app, `${volume}`);
		nbws.once("volume_set", (data) => {
			nbws.cache = JSON.parse(data[0]);
			updateKeys(nbws.cache);
		});
	}
}

export function generic() {
	
	universal.nbws = nbws;

	universal.nbws.on("error", (data) => {
		universal.sendToast("Native WebSocket", data[0]);
	});

	universal.nbws.on("apps", (data) => {
		universal.nbws.cache = JSON.parse(data[0]);
		updateKeys(JSON.parse(data[0]));
	});

	if(Object.values(universal.nbws.cache).length !== 0) updateKeys(universal.nbws.cache);
	grabAndHandle();
	grabAndHandle();
	universal.listenFor("page_change", () => {
		if(Object.values(universal.nbws.cache).length !== 0) updateKeys(universal.nbws.cache);
		grabAndHandle();
	});
	setInterval(() => {
		if(Object.values(universal.nbws.cache).length !== 0) updateKeys(universal.nbws.cache);
		grabAndHandle();
	}, 250);
}

const sendVolume = (app, volume) => {
	universal.nbws.setVolume(app, volume);
};

export function handler() {
	universal.on(universal.events.companion.native_keypress, (data) => {
		sendVolume(data.data.app, data.data.value);
	});

	universal.on(universal.events.keypress, (data) => {
		if (data.type === "fd.profile") {
			universal.page = 0;
			universal.save("page", universal.page);
			universal.send(universal.events.companion.set_profile, data.data.profile);
		}
		if(data.type === "fd.fullscreen") {
			// request fullscreen
			const elem = document.documentElement; // This can be any element
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.mozRequestFullScreen) { // Firefox
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
				elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) { // IE/Edge
				elem.msRequestFullscreen();
			}
		}
	});
}