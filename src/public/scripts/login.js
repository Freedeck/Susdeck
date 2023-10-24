import { universal } from './universal.js';

await universal.init('Main:Login');

universal.send(universal.events.login_data, { tlid: universal._information.tempLoginID })