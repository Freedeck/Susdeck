/**
 * @param {*} data Freedeck Button Config
 * @param {*} keyObject Key Object
 */
export default function (data, keyObject, raw) {
	const sliderContainer = document.createElement("div");
	sliderContainer.className = "slider-container";
	sliderContainer.dataset.value = data.data.value;
	keyObject.appendChild(sliderContainer);

	const sliderTitle = document.createElement("div");
	sliderTitle.className = "slider-title";
	sliderTitle.innerText = Object.keys(raw)[0];
	sliderContainer.appendChild(sliderTitle);

	const sliderThumb = document.createElement("div");
	sliderThumb.className = "slider-thumb context-aware";
	sliderContainer.appendChild(sliderThumb);

	const sliderPercentage = document.createElement("div");
	sliderPercentage.className = "slider-percentage";
	sliderPercentage.innerText = `${data.data.value}${data.data.format ? data.data.format : "%"}`;
	sliderContainer.appendChild(sliderPercentage);
	sliderContainer.dataset.value = data.data.value;

	sliderThumb.oncontextmenu = (e) => {
		sliderThumb.parentElement.parentElement.oncontextmenu(e);
	};

	const index = data.position;
	const row = Math.floor((index - 1) / 5);
	const col = (index - 1) % 5;
	const top = `${row * 33}%`;
	const left = `${col * 20}%`;

	sliderContainer.style.top = top;
	sliderContainer.style.left = left;

	let isDragging = false;
	const updateSlider = (event) => {
		const rect = sliderContainer.getBoundingClientRect();
		let value;
		if (data.data.direction === "vertical") {
			let newTop = event.clientY - rect.top;
			if (newTop < 0) newTop = 0;
			if (newTop > rect.height) newTop = rect.height;

			value =
				((rect.height - newTop) / rect.height) *
					(data.data.max - data.data.min) +
				data.data.min;
		} else {
			let newLeft = event.clientX - rect.left;
			if (newLeft < 0) newLeft = 0;
			if (newLeft > rect.width) newLeft = rect.width;

			value =
				(newLeft / rect.width) * (data.data.max - data.data.min) +
				data.data.min;
		}

		value = Math.min(Math.max(value, data.data.min), data.data.max); // Ensure value is within bounds

		sliderContainer.dataset.value = value;
		data.data.value = value;

		const percentage =
			((value - data.data.min) / (data.data.max - data.data.min)) * 100;
		sliderContainer.style.background =
			data.data.direction === "vertical"
				? `linear-gradient(to top, var(--fd-slider-background) ${percentage}%, var(--fd-slider-foreground) ${percentage}%)`
				: `linear-gradient(to right, var(--fd-slider-background) ${percentage}%, var(--fd-slider-foreground) ${percentage}%)`;

		const rounded = Number.parseFloat(value).toFixed(1);
		sliderPercentage.innerText = `${rounded}${data.data.format ? data.data.format : "%"}`;
	};

	setInterval(() => {
		// sync slider value with data
		if (sliderContainer.dataset.value === data.data.value) return;

		data.data.value = sliderContainer.dataset.value;
		const min = data.data.min;
		const max = data.data.max;
		const value = data.data.value;
		const percentage = ((value - min) / (max - min)) * 100;

		if (data.data.direction === "vertical") {
			sliderContainer.style.background = `linear-gradient(to top, var(--fd-slider-background) ${percentage}%, var(--fd-slider-foreground) ${percentage}%)`;
		} else {
			sliderContainer.style.background = `linear-gradient(to right, var(--fd-slider-background) ${percentage}%, var(--fd-slider-foreground) ${percentage}%)`;
		}

		const rounded = Number.parseFloat(value).toFixed(1);
		sliderPercentage.innerText = `${rounded}${data.data.format ? data.data.format : "%"}`;
	}, 500);

	const touchDownEvent = (e) => {
		if (e.target !== sliderThumb) return;
		sliderContainer.dataset.dragging = true;
		isDragging = true;
	};

	sliderThumb.addEventListener("mousedown", touchDownEvent);
	sliderThumb.addEventListener("touchstart", touchDownEvent);
	sliderContainer.addEventListener("mousedown", touchDownEvent);
	sliderContainer.addEventListener("touchstart", touchDownEvent);

	document.addEventListener("mousemove", (event) => {
		if (isDragging) {
			updateSlider(event);
		}
	});

	document.addEventListener("touchmove", (event) => {
		if (isDragging) {
			updateSlider(event.touches[0]);
		}
	});

	document.addEventListener("mouseup", () => {
		isDragging = false;
		sliderContainer.dataset.dragging = false;
	});

	document.addEventListener("touchend", () => {
		isDragging = false;
		sliderContainer.dataset.dragging = false;
	});

	const percent =
		((data.data.value - data.data.min) / (data.data.max - data.data.min)) * 100;
	sliderContainer.style.background = `linear-gradient(to right, var(--fd-slider-background) ${percent}%, var(--fd-slider-foreground) ${percent}%)`;
	if (data.data.direction === "vertical") {
		sliderContainer.style.background = `linear-gradient(to top, var(--fd-slider-background) ${percent}%, var(--fd-slider-foreground) ${percent}%)`;
	}

	keyObject.onclick = (ev) => {
		universal.send(universal.events.keypress, {
			isSlider: true,
			sliderValue: data.data.value,
			event: ev,
			btn: data,
		});
	};
}
