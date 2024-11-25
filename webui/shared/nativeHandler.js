let nativeDataCache = [];

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

export function generic() {
	if(Object.values(nativeDataCache).length !== 0) updateKeys(nativeDataCache);
	grabAndHandle();
	grabAndHandle();
	universal.listenFor("page_change", () => {
		if(Object.values(nativeDataCache).length !== 0) updateKeys(nativeDataCache);
		grabAndHandle();
	});
	setInterval(() => {
		if(Object.values(nativeDataCache).length !== 0) updateKeys(nativeDataCache);
		grabAndHandle();
	}, 250);

	universal.nbws = {
		_socket: new WebSocket('ws://localhost:5756/'),
		connected: false,
		_callbacks: {},
		send: (data, ...args) => {
			if (universal.nbws._socket.readyState === WebSocket.OPEN) {
				universal.nbws._socket.send(JSON.stringify({Event: data, Data: [...args]}));
			}
		},
		on: (event, callback) => {
			if(!universal.nbws._callbacks[event])
				universal.nbws._callbacks[event] = [];
			universal.nbws._callbacks[event].push(callback);
		},
		once: (event, callback) => {
			if(!universal.nbws._callbacks[event])
				universal.nbws._callbacks[event] = [];
			const fn = (...args) => { 
				callback(...args);
				universal.nbws._callbacks[event] = universal.nbws._callbacks[event].filter((x) => x !== fn);
			};
			universal.nbws._callbacks[event].push(fn);
		},
		setVolume: (app, volume) => {
			universal.nbws.send("set_volume", app, "" + volume);
			universal.nbws.once("volume_set", (data) => {
				nativeDataCache = JSON.parse(data[0]);
				updateKeys(nativeDataCache);
			});
		},
		doOnOpen: () => {
			universal.nbws._socket.onopen = (event) => {
				universal.nbws.connected = true;
					console.log('WebSocket is open now.');
					universal.nbws.Interval = setInterval(() => {
						
					}, 1000);
					
			};
		
			universal.nbws._socket.onclose = (event) => {
				universal.nbws.connected = false;
				clearInterval(universal.nbws.Interval);
					console.log('WebSocket is closed now.');
			};

			universal.nbws.on("error", (data) => {
				universal.sendToast("Native WebSocket", data[0]);
			});

			universal.nbws.on("apps", (data) => {
				nativeDataCache = JSON.parse(data[0]);
				updateKeys(JSON.parse(data[0]));
			});
		
			universal.nbws._socket.onmessage = (event) => {
				const realData = atob(event.data);
					try {
						const data = JSON.parse(realData);
						if(!universal.nbws._callbacks[data.Event]) return;
						for(const callback of universal.nbws._callbacks[data.Event]) {
							callback(data.Data);
						}
					} catch (e) {
						console.log(`Failed to parse JSON: ${e}`);
					}
			};
		
			universal.nbws._socket.onerror = (error) => {
					console.error(`WebSocket error: ${error}`);
			};
		}
	}
	universal.nbws.doOnOpen();
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