const eventNames = {
  client_greet: 'fd.greetings',

  login_data: 'fd.login.data',
  login: 'fd.login',
  login_data_ack: 'fd.login_data.ack',

  information: 'fd.info',
  no_init_info: 'fd.info.noinit',

  keypress: 'fd.keypress',

  not_trusted: 'fd.trust.fail',
  not_auth: 'fd.auth.check.fail',
  not_match: 'fd.auth.match.fail',

  notif: 'fd.notification',

  log: 'fd.log',

  plugin_info: 'fd.plugin_data',

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

  reload: 'fd.reload',
};

if ('exports' in module) module.exports = eventNames;
