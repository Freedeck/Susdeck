const eventNames = {
    client_greet: 'fd.greetings',

    login_data: 'fd.login.data',
    login: 'fd.login',
    login_data_ack: 'fd.login_data.ack',

    information: 'fd.info',
}

if ('exports' in module) module.exports = eventNames;
