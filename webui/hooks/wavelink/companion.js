const styleLoader = document.createElement("link");
styleLoader.rel = "stylesheet";
styleLoader.href = "/hooks/wavelink/wl.css";
document.head.appendChild(styleLoader);

universal.on("wl.stat", (data) => {
	data = JSON.parse(data);
	document.querySelectorAll(".button").forEach((btn) => {
		const inter = JSON.parse(btn.getAttribute("data-interaction"));
		if (inter == null) return;
		if (
			(inter.type == "wl.m." + data.input && data.type == "m") ||
			(inter.type == "wl.sm." + data.input && data.type == "sm")
		) {
			if (data.value == true) {
				btn.classList.remove("wl_active");
				btn.classList.add("wl_inactive");
			} else {
				btn.classList.remove("wl_inactive");
				btn.classList.add("wl_active");
			}
		}
	});
});

universal.on("wl.vol", (data) => {
	data = JSON.parse(data);
	document.querySelectorAll(".button").forEach((btn) => {
		const inter = JSON.parse(btn.getAttribute("data-interaction"));
		if (inter == null) return;

		if (
			(inter.type == "wl.v." + data.input && data.type == "v") ||
			(inter.type == "wl.vm." + data.input && data.type == "vm")
		) {
			const sl = btn.querySelector(".slider-container");
			if (sl.dataset.dragging != "true") sl.dataset.value = data.value;
		}
	});
});

const wl_handlePageChange = () => {
	document.querySelectorAll(".button").forEach((btn) => {
		const inter = JSON.parse(btn.getAttribute("data-interaction"));
		if (inter != null) {
			if (inter.type.startsWith("wl.m.") || inter.type.startsWith("wl.sm.")) {
				if (
					btn.classList.contains("wl_active") ||
					btn.classList.contains("wl_inactive")
				)
					return;
				const type = inter.type.split("wl.")[1].split(".")[0];
				universal.send(
					"wl.stat",
					inter.type.split(".").pop().trim() + "@" + type,
				);
				btn.addEventListener("click", () => {
					setTimeout(() => {
						universal.send(
							"wl.stat",
							inter.type.split(".").pop().trim() + "@" + type,
						);
					}, 50);
				});
			} else if (
				inter.type.startsWith("wl.v") ||
				inter.type.startsWith("wl.vm")
			) {
				universal.send(
					"wl.vol",
					inter.type.split(".").pop().trim() + "@" + inter.type.split(".")[1],
				);
			}
		}
	});
};

wl_handlePageChange();

universal.listenFor("page_change", () => {
	wl_handlePageChange();
});
