const eventNames = {
  client_greet: 'fd.greetings',
  information: 'fd.info',
  keypress: 'fd.keypress',
  login: {
    login_data: 'fd.login.data',
    login: 'fd.login',
    login_data_ack: 'fd.login_data.ack',
  },
  default: {
    no_init_info: 'fd.info.noinit',

    not_trusted: 'fd.trust.fail',
    not_auth: 'fd.auth.check.fail',
    not_match: 'fd.auth.match.fail',
    set_theme: 'fd.theme.set',

    notif: 'fd.notification',

    log: 'fd.log',

    plugin_info: 'fd.plugin_data',

    channel_send: 'fd.channel.send',
    channel_listening: 'fd.channel.listen',
    reload: 'fd.reload',
  },

  companion: {
    conn_fail: 'fd.companion.conn.fail',
    new_key: 'fd.companion.keys.new',
    del_key: 'fd.companion.keys.del',
    edit_key: 'fd.companion.keys.edit',
    move_key: 'fd.companion.keys.move',
    set_profile: 'fd.companion.profile.set',
    add_profile: 'fd.companion.profile.add',
    dup_profile: 'fd.companion.profile.duplicate',
  },

};

if ('exports' in module) module.exports = eventNames;
