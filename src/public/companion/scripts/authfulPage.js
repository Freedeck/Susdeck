const universal = window.universal;

if (!HTMLElement.prototype.setHTML) {
	HTMLElement.prototype.setHTML = function (html) {
		this.innerHTML = html;
	};
}

universal.listenFor("init", () => {
	if (!universal._authStatus) {
		const login = document.createElement("li");
		login.id = "login";
		login.setHTML('<a href="#">Login</a>');
		login.onclick = () => {
			if (document.querySelector("#login-msg"))
				document.querySelector("#login-msg").setHTML("Login to Freedeck");
		};
		// while (!document.querySelector('#sidebar > ul')) {}
		document.querySelector("#sidebar > ul").appendChild(login);
	}

	if (universal.load("fd.passwd")) {
		universal.login(universal.load("fd.passwd"));
		document.querySelector("#login-dialog").style.display = "none";
	} else {
		document.querySelector("#login-dialog").style.display = "block";
		document.querySelector("#login-div").style.opacity = "1";
	}

	universal.on(universal.events.login.login, (dat) => {
		if (dat === true) {
			document.querySelector("#login").remove();
			if (universal.load("logintime") > Date.now())
				universal.sendToast("Logged in!");
			if (
				document.querySelector("#password") &&
				document.querySelector("#password").value !== ""
			)
				universal.save("fd.passwd", document.querySelector("#password").value);
			universal.save("logintime", Date.now());
			document.querySelector("#login-div").style.opacity = "0";
			document.querySelector("#login-dialog").style.opacity = "0";
			setTimeout(() => {
				document.querySelector("#login-dialog").style.display = "none";
			}, 250);
		} else {
			document.querySelector("#login-msg").setHTML("Login failed.");
		}
	});
});
