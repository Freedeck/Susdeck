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

    onInitialize () {
        return true;
    }
}
