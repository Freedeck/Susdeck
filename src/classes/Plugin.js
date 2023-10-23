module.exports = class Plugin {
    name;
    author;
    id;
    disabled;

    constructor(name, author, id, disabled = false) {
        this.name = name;
        this.author = author;
        this.id = id;
        this.disabled = disabled;
        this.hasInit = this.onInitialize();
        if (!this.hasInit) {
            console.log('Plugin didn\'t initialize?');
        }
    }

    registerNewType (name, type) {
        // console.log(types.get(type));
    }

    onInitialize () {
        return true;
    }

    onButton (interaction) {
        return true;
    }
}
