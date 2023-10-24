const eventNames = {
    client_greet: 'fd.greetings',

    login_data: 'fd.login.data',
    login: 'fd.login',
    login_data_ack: 'fd.login_data.ack',

    information: 'fd.info',

    keypress: 'fd.keypress',

    not_trusted: 'fd.trust.fail',
    not_auth: 'fd.auth.check.fail',
    not_match: 'fd.auth.match.fail',

    notif: 'fd.notification',

    log: 'fd.log',

    plugin_info: 'fd.plugin_data'
}

if ('exports' in module) module.exports = eventNames;
