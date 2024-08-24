const eventNames = {
	client_greet: "G",
	information: "I",
	keypress: "K",
	user_mobile_conn: "U",
	login: {
		login_data: "lD",
		login: "lL",
		login_data_ack: "lDA",
	},
	default: {
		no_init_info: "dNI",

		not_trusted: "dtF",
		not_auth: "daCF",
		not_match: "daMF",
		set_theme: "dT",

		notif: "dN",

		log: "dL",

		plugin_info: "dP",

		channel_send: "dcO",
		channel_listening: "dcI",
		reload: "dR",
		recompile: "dC",

		download_plugin: "dDP",
		plugin_downloaded: "dPD",
		disable_plugin: "dBP",
		enable_plugin: "dEP",
		plugins_updated: "dPU",
		update_plugins: "dUP",
		config_changed: "dCC",
		slider_update: "sU",
	},

	companion: {
		conn_fail: "cF",
		new_key: "ckN",
		del_key: "ckD",
		edit_key: "ckE",
		move_key: "ckM",
		set_profile: "cpS",
		add_profile: "cpA",
		dup_profile: "cpD",
		set_theme: "ctS",
		plugin_set: "dPS",
		plugin_set_all: "dPSA",
		import_profile: "cpI",
		native_keypress: "nkP",
	},

	rpc: {
		authorize: "RPC.Authorize",
		reply: "RPC.Reply",
	},
};

if ("exports" in module) module.exports = eventNames;
