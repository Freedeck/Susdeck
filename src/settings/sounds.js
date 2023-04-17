/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = false
const ScreenSaverActivationTime = 15
const soundDir = '../assets/sounds/'
const Sounds = [
    { "name": "Shooting", "icon": "shooting.png", "path": "shooting.mp3" },
    {
        "name": "Footsteps",
        "icon": "footsteps.png",
        "path": "loudfootsteps.mp3"
    },
    { "name": "Whoppah", "icon": "whopper.png", "path": "WHOPPER.mp3" },
    { "name": "Didn't I Do It", "icon": "borzoi.png", "path": "borzio.mp3" },
    {
        "name": "Biggest Bird",
        "icon": "bird.png",
        "path": "biggestbird.wav"
    },
    {
        "name": "Disconnect",
        "icon": "disconnect.png",
        "path": "disconnect.mp3"
    },
    { "name": "Vine Boom", "icon": "boom.png", "path": "vineboom.mp3" },
    { "name": "Semtex", "icon": "semtex.png", "path": "semtex.mp3" },
    {
        "name": "Alt Tab",
        "keys": "[\"alt\",\"tab\"]",
        "icon": "alt_tab.png"
    },
    {
        "name": "Starting OBS",
        "keys": "[\"alt\",\"f24\"]",
        "icon": "alt_tab.png"
    },
    {
        "name": "Main OBS",
        "keys": "[\"alt\",\"f23\"]",
        "icon": "alt_tab.png"
    },
    {
        "name": "Start Stream OBS",
        "keys": "[\"alt\",\"f21\"]",
        "icon": "alt_tab.png"
    },
    {
        "name": "End Stream OBS",
        "keys": "[\"alt\",\"f22\"]",
        "icon": "alt_tab.png"
    },
    { "name": "Ohio Sound", "icon": "ohio.png", "path": "ohio.mp3" },
    { "name": "Whoppah Remix", "path": "wopha_remix.wav" },
    { "name": "Stop All", "path": "--Stop_all" }
]
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds }
