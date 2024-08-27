universal.on("haf.statechange", (data) => {
	document.querySelectorAll(".button").forEach((button) => {
		if (button.getAttribute("data-interaction")) {
			const dat = JSON.parse(button.getAttribute("data-interaction"));
			if (dat.type == data.wanted) {
				const txt = button.querySelector(".button-text").querySelector("p");
				txt.innerText = data.state;
			}
		}
	});
});

universal.send("haf.forceupdate");

universal.listenFor("page_change", () => {
	universal.send("haf.forceupdate");
});
