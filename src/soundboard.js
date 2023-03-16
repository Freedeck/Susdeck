/**
 * Welcome to the Soundboard config.
 * TODO: implement
 */

const soundDir = './s/'
const sounds = [
  { name: 'Footsteps', key: 'f23', path: 'loudfootsteps.mp3' },
  { name: 'Whoppah', key: 'f22', path: 'WHOPPER.mp3' },
  { name: "Didn't I Do It", key: 'f18', path: 'borzoi.mp3' },
  { name: 'Biggest Bird', key: 'f21', path: 'biggestbird.wav' },
  { name: 'Disconnect', key: 'f20', path: 'disconnect.mp3' },
  { name: 'Vine Boom', key: 'f16', path: 'vineboom.mp3' },
  { name: 'Semtex', key: 'f17', path: 'semtex.mp3' },
  { name: 'Whoppah Remix', key: 'f15', path: 'DSJSJSK.wav' },
  { name: 'Stopping All', key: 'f19', path: '--Stop_all' },
]

module.exports = { sounds, soundDir }
