/* eslint no-unused-vars: "off" */
// Welcome to the sound config. Here this should be pretty self explanatory.
// Keys for a macro, one at a time
// Key for 1 key (f24)
// Name for display name
// Icon is not required, but if you want to I recommend 100x100px png in black and white. You can do whatever though!

// But first, do you want a feedback (press.mp3) played on button pressed?
const SoundOnPress = true
// true for yes, false for no.

// Cool, in seconds, when do you want the screensaver to be activated?
const ScreenSaverActivationTime = 25

const Sounds = [
  {
    name: 'Shooting',
    keys: [
      'alt',
      'f24'
    ],
    icon: 'shooting.png'
  },
  {
    name: 'Footsteps',
    key: 'f23',
    icon: 'footsteps.png'
  },
  {
    name: 'Whopper',
    key: 'f22',
    icon: 'whopper.png'
  },
  {
    name: 'Didn\'t I Do It',
    key: 'f18',
    icon: 'borzio.png'
  },
  {
    name: 'Biggest Bird',
    key: 'f21',
    icon: 'bird.png'
  },
  {
    name: 'Disconnect',
    key: 'f20',
    icon: 'disconnect.png'
  },
  {
    name: 'Vine Boom',
    key: 'f16',
    icon: 'boom.png'
  },
  {
    name: 'Semtex',
    key: 'f17',
    icon: 'semtex.png'
  },
  {
    name: 'Alt Tab',
    keys: [
      'alt',
      'tab'
    ],
    icon: 'alt_tab.png'
  },
  {
    name: 'Ohio Sound',
    keys: [
      'alt',
      'f23'
    ],
    icon: 'ohio.png'
  }
]

module.exports = {SoundOnPress, ScreenSaverActivationTime, Sounds}