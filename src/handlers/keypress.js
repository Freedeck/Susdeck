const eventNames = require("./eventNames");
const debug = require("../utils/debug");
const settings = require("../managers/settings");
const cfg = settings.settings();

module.exports = {
	name: "Keypress Handler",
	id: "fd.handlers.keypress",
	flags: ["AUTH"],
	exec: ({ socket, types, plugins, io }) => {
		socket.on(eventNames.keypress, (ev) => {
			try {
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
						io.emit(eventNames.companion.native_keypress, ev.btn);
					}
					return;
				}
				if (ev.builtIn) {
					if (ev.data === "stop-all")
						io.emit(eventNames.keypress, {
							type: "fd.stopall",
							sound: { name: "Stop All" },
						});
					return;
				}
				io.emit(eventNames.keypress, ev.btn);
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
