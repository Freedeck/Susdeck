const updateKeys = (data) => {
	const formatted = {};
	for (const el of data) {
		// {name: 'app', friendly: 'App Name', volume: 0.5}
		formatted[el.name] = [el.friendly, el.volume];
	}
	for (const el of document.querySelectorAll(".button")) {
		if (!el.getAttribute("data-interaction")) return;
		let interact = el.getAttribute("data-interaction");
		interact = JSON.parse(interact);
		if (interact.data?.app && formatted[interact.data.app]) {
			interact.data.value = formatted[interact.data.app][1] * 100;
			el.setAttribute("data-interaction", JSON.stringify(interact));
			el.querySelector(".slider-container").dataset.value =
				formatted[interact.data.app][1] * 100;
		}
	}
};

export function grabAndHandle() {
	// fetch("/native/volume/apps")
	// 	.then((res) => res.json())
	// 	.then((a) => {
	// 		updateKeys(a);
	// 	})
	// 	.catch((err) => {});
}

export function generic() {
	grabAndHandle();
	grabAndHandle();
	universal.listenFor("page_change", () => {
		grabAndHandle();
	});
	setInterval(() => {
		grabAndHandle();
	}, 250);
}

const sendVolume = (padded, app = "") => {
	fetch(`/native/volume/app/${padded}/${app}`)
		.then((res) => res.json())
		.then((a) => {
			console.log(a);
		})
		.catch((err) => {
			console.log("Error while fetching app volume", err);
		});
};

export function handler() {
	universal.on(universal.events.companion.native_keypress, (data) => {
		if (data.type === "fd.sys.volume") {
			const padded =
				data.data.value.length === 1
					? `00${data.data.value}`
					: data.data.value.length === 2
						? `0${data.data.value}`
						: data.data.value;
			fetch(`/native/volume/app/${padded}/${data.data.app}`)
				.then((res) => res.json())
				.then((a) => {
					for(const button of document.querySelectorAll('.button')) {
						if (button.getAttribute('data-interaction')) {
							let dat = button.getAttribute('data-interaction');
							dat = JSON.parse(dat);
							if (dat.data?.app === data.data.app) {
								dat.data.value = a.Volume;
								button.setAttribute("data-interaction", JSON.stringify(dat));
								button.querySelector(".slider-container").dataset.value = a.Volume;
							}
						}
					};
				})
				.catch((err) => {
					console.log("Error while fetching app volume", err);
				});
		} else if (data.type === "fd.sys.volume.sys") {
			const padded =
				data.data.value.length === 1
					? `00${data.data.value}`
					: data.data.value.length === 2
						? `0${data.data.value}`
						: data.data.value;
			fetch(`/native/volume/sys/${padded}`)
				.then((res) => res.json())
				.then((a) => {
					for(const button of document.querySelectorAll('.button')) {
						if (button.getAttribute('data-interaction')) {
							let dat = button.getAttribute('data-interaction');
							dat = JSON.parse(dat);
							if (dat.data?.app === data.data.app) {
								dat.data.value = a.Volume;
								button.setAttribute("data-interaction", JSON.stringify(dat));
								button.querySelector(".slider-container").dataset.value = a.Volume;
							}
						}
					};
				})
				.catch((err) => {
					console.log("Error while fetching system volume", err);
				});
		}
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
