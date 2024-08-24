const eventNames = require("./eventNames");
const debug = require("../utils/debug");
const settings = require("../managers/settings");
const cfg = settings.settings();

module.exports = {
	name: "Keypress Handler",
	id: "fd.handlers.keypress",
	exec: ({ socket, types, plugins, io }) => {
		socket.on(eventNames.keypress, (ev) => {
			if (socket.auth !== true && cfg.useAuthentication) {
				socket.emit(eventNames.default.not_auth);
				return;
			}
			try {
				console.log(ev);
				ev = JSON.parse(ev);
				if (ev.isSlider) {
					callPlugin(types, plugins, ev);
					// set the slider value
					for (const snd in cfg.profiles[cfg.profile]) {
						for (const key in snd) {
							if (snd[key].uuid === ev.btn.uuid) {
								snd[key].data = ev.btn.data;
								settings.save();
								break;
							}
						}
					}
					if (ev.btn.type.startsWith("fd.sys.")) {
						io.emit(
							eventNames.companion.native_keypress,
							JSON.stringify(ev.btn),
						);
					}
					return;
				}
				if (ev.builtIn) {
					if (ev.data === "stop-all")
						io.emit(
							eventNames.keypress,
							JSON.stringify({ sound: { name: "Stop All", type: "fd.sound" } }),
						);
					return;
				}
				if (!ev.event.isTrusted) {
					socket.emit(eventNames.default.not_trusted);
					return;
				}
				io.emit(eventNames.keypress, JSON.stringify(ev.btn));
				callPlugin(types, plugins, ev);
			} catch (e) {
				debug.log(e);
			}
		});
	},
};

const callPlugin = (types, plugins, ev) => {
	if (types().get(ev.btn.type) || plugins.get(ev.btn.type)) {
		if (types().get(ev.btn.type)) {
			types().get(ev.btn.type).instance.onButton(ev.btn);
			return;
		}
		if (plugins.get(ev.btn.type)) {
			plugins.get(ev.btn.type).instance.onButton(ev.btn);
		}
	}
};
