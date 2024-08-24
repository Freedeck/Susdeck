universal.listenFor("loadHooks", () => {
	Object.keys(universal.plugins).forEach((plugin) => {
		const data = universal.plugins[plugin];
		data.hooks
			.filter((ref) => ref.type === 1)
			.forEach((hook) => {
				const scr = document.createElement("script");
				scr.src = `/hooks/${hook.name}`;
				document.body.appendChild(scr);
			});
	});
});
