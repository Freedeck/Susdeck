universal.listenFor("loadHooks", () => {
	for (const plugin of Object.keys(universal.plugins)) {
		const data = universal.plugins[plugin];
		for (const hook of data.hooks.filter((ref) => ref.type === 1)) {
			const scr = document.createElement("script");
			scr.src = `/hooks/${hook.name}`;
			document.body.appendChild(scr);
		}
	}
});
