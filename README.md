![alt text](https://github.com/susdeck/susdeck/blob/master/src/app/assets/icons/susdeck.png?raw=true)

# Susdeck

Susdeck is love. Susdeck is life. Susdeck is not a Stream Deck.
Susdeck is a macro pad meant to model a Stream Deck with macro capabilities.  
So far, Susdeck only officially supports iOS devices (for the standalone web app)

## Join the Discord!
You can join the official Susdeck Discord server over at [https://discord.gg/SdA2YfEb6R](https://discord.gg/SdA2YfEb6R)

## What does it look like?
These screenshots were taken on a desktop environment made to look like mobile.
![Susdeck UI preview](https://github.com/susdeck/susdeck/blob/master/demo/preview.png?raw=true)
Here's a preview of the login screen:
![Susdeck Login preview](https://github.com/susdeck/susdeck/blob/master/demo/login.png?raw=true)
here's a preview of the companion home screen:
![Susdeck Companion Home preview](https://github.com/susdeck/susdeck/blob/master/demo/c-home.png?raw=true)
here's a preview of the companion icon editor:
![Susdeck Companion Home preview](https://github.com/susdeck/susdeck/blob/master/demo/c-ie.png?raw=true)
and finally, here's a preview of the companion icon editor editing.
![Susdeck Companion Home preview](https://github.com/susdeck/susdeck/blob/master/demo/c-ie-e.png?raw=true)

## How do I use Susdeck?
** First, you will need VB-cable (Virtual audio cable Susdeck uses) **

Clone the repo, then change `Settings.js.default` to only have it's extension `.js`.  
Next, modify the settings however you want, you can add authentication, a password, and a message for when somebody tries to login to your Susdeck.  

Now, for the fun part. Run `npm i` and then `npm run start`.  

Susdeck Companion will open. **This is normal!** This is how you will configure your sounds/keybinds for Susdeck.  
Now your computer is hosting a server on port 3000. Get any iOS device and go to `yourlocalip:3000` in Safari.  
Now, add the app to your home screen by pressing the share button.  
Next, open the app on your device. It will be full screen.  
**Susdeck is best used in landscape/horizontal mode.** 

There are preloaded keys, for example `Shooting` will make CoD shooting sounds play through your computer and your VB-Cable.

## How do I make my own sounds/macros?
Susdeck processes keys & plays sounds at the front-end, and it uses robotjs & Companion to press/play them on your computer.  
It is very easy to add your own macros/sounds.  
All you need to do is edit `src/settings/sounds.js` to your liking using the above instructions.  
**Icons are not required for any macro/sound!**  
To add a sound, look for `const Sounds =` and go to the ending tag `]`. Next, you'll want to insert this snippet:
```js
        {
            name: 'What The Dog Doin?',
            icon: 'susdeck.png'
        }
```
You'll also need to edit `src/settings/soundboard.js` to link it to an audio file. It's the same process, except you'll need to insert (& change) this snippet:
```js
        { 
            name: 'What the Dog Doin?', 
            path: 'what_the_dd.mp3' 
        },
```
**Make sure that `what_the_dd.mp3` or any other file you use is inside of `src/app/assets/sounds` or it will not work!**  
Congratulations, you have added your own sound! Susdeck Companion will soon be able to do this process automagically.

## Tested Devices
Susdeck has not had many devices tested on it. Information on how to contribute to testing will be added later. For now, these are the officially supported devices.
| Tested Device      | Does it work? | Is it practical? | Does it look good? | Final Notes                                  |
|--------------------|---------------|------------------|--------------------|----------------------------------------------|
| iPod Touch 7th Gen | Yes.          | Yes.             | Yes.               | Susdeck was made for the iPod Touch 7th gen  |
| iPhone 12          | Yes.          | Yes.             | Yes.           | No comment |
| Desktop         | Yes.          | No.             | Meh.           | Susdeck is made for touchscreen devices when you can't instantly press a key. |