const path = require("path");
const cfg = {
    sounds: [
        {'Name': {
            'uuid': 'abcdef',
            'type': 'fd.sound',
            'data': {
                'file': 'abcdef.mp4',
                'path': path.resolve('./src/public/sounds/')
            },
            'pos': {
                'page': 0,
                'index': 3
            }
        }}
    ],
    screenSaverActivationTime: 15,
    soundOnPress: false,
    iconCountPerPage: 12,
};

if (typeof window !== "undefined") window['cfg'] = cfg;
if ('exports' in module) module.exports = cfg;