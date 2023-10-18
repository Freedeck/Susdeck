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
        console.log('Plugins not implemented, but ' + name + ' "init".')
    }
}
