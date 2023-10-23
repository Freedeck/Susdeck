const path = require("path");
const cfg = {
    sounds: [
        {'Name': {
            'uuid': 'abcdef',
            'type': 'fd.sound',
            'data': {
                'file': 'vine-boom.mp3',
                'path': '/sounds/'
            },
            'pos': 3
        }},
        {'Example Plugin Test': {
            'uuid': 'ghijkl',
            'type': 'fd.plugins.example',
            'data': {
                'test': true
            },
            'pos': 2
        }},
        {'Play YTMD TEst': {
                'uuid': 'mnopqr',
                'type': 'roi.ytmd-controller.play',
                'data': {
                    'test': true
                },
                'pos': 1
            }},
    ],
    screenSaverActivationTime: 15,
    soundOnPress: false,
    iconCountPerPage: 15,
};

if (typeof window !== "undefined") window['cfg'] = cfg;
if ('exports' in module) module.exports = cfg;