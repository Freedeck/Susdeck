/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = false;
const ScreenSaverActivationTime = 1;
const soundDir = '../assets/sounds/';
const Sounds = [{"name":"Shooting","icon":"shooting.png","path":"shooting.mp3"},{"name":"Footsteps","icon":"footsteps.png","path":"loudfootsteps.mp3"},{"name":"Whoppah","path":"WHOPPER.mp3","icon":"whopper.png"},{"name":"Didn't I Do It","icon":"borzoi.png","path":"borzio.mp3"},{"name":"Biggest Bird","icon":"bird.png","path":"biggestbird.wav"},{"name":"Disconnect","icon":"disconnect.png","path":"disconnect.mp3"},{"name":"Vine Boom","icon":"boom.png","path":"vineboom.mp3"},{"name":"Semtex","icon":"semtex.png","path":"semtex.mp3"},{"name":"Huh","path":"huh.mp3"},{"name":"Haha","path":"haha.mp3"},{"name":"Alt Tab","keys":"[\"alt\",\"tab\"]"},{"name":"Whoppah Remix","path":"wopha_remix.wav"},{"name":"Bugatti","path":"bugatti.mp3"},{"name":"Metal Pipe","path":"metal_pipe.mp3"},{"name":"Alt F4","keys":"[\"alt\",\"f4\"]"}];
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
