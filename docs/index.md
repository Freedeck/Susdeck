# Susdeck

Susdeck is love. Susdeck is life. Susdeck is not a Stream Deck.
Susdeck is a macro pad meant to model a Stream Deck with macro capabilities.  
Susdeck does not play sounds, it is meant to control your computer with minimal ease like a Stream Deck.  
You'll need to set up your own soundboard, keybinds, icons (if wanted) if you want a setup like mine.  
For the soundboard, I recommend [Soundux](https://github.com/Soundux/Soundux).  
So far, Susdeck only officially supports iOS.

## Join the Discord!
[https://discord.gg/SdA2YfEb6R](https://discord.gg/SdA2YfEb6R)

## What does it look like?
![Susdeck UI preview](https://github.com/susdeck/susdeck/blob/master/demo/preview.png?raw=true)
and here's a preview of the login screen:
![Susdeck Login preview](https://github.com/susdeck/susdeck/blob/master/demo/login.png?raw=true)

## How do I use Susdeck?
Clone the repo, then change `Settings.js.default` to only have it's extension `.js`.  
Next, modify the settings however you want, you can add authentication, a password, and a message for when somebody tries to login to your Susdeck.  
Now, for the fun part. Run `npm i` and then `npm run start`.  
Susdeck Companion will open. This is normal! This is how you will configure your sounds/keybinds for Susdeck.  
Now your computer is hosting a server on port 3000. Get any iOS device and go to `yourlocalip:3000` in Safari.  
Now, add the app to your home screen by pressing the share button.  
Next, open the app on your device. It will be full screen.  
**Susdeck is best used in landscape/horizontal mode.**  
There are preloaded keys, for example `Shooting` will press Alt+F24 - it is meant to be a keybind in a soundboard.  

## But I have more than *9* macros, how can I fix this?
The `sounds.js` file will take your sounds, Susdeck's `autosort.js` will sort it into pages that can be accessed with a swipe left or right.  
To add a sound, look for `const Sounds =` and go to the ending tag `]`. Next, you'll want to insert this snippet:
```js
        {
            name: 'What The Dog Doin?',
            keys: [
                'alt',
                'f4'
            ],
            // *Common sense!* As a warning do not use alt+f4 as an actual keybind. It will close your running program! This is just an example of a new page.
            icon: 'susdeck.png'
        }
```
Congratulations, you have added your own sound! Susdeck Companion will soon have this feature.

## How do I make my own sounds/macros?
Susdeck processes keys at the front-end, and it uses robotjs to press them on your computer.  
It is very easy to add your own macros/sounds.  
All you need to do is edit `app/sounds.js` to your liking using the above instructions.  
**Icons are not required for any macro/sound!**  

## Tested Devices
Susdeck has not had many devices tested on it. Information on how to contribute to testing will be added later. For now, these are the officially supported devices.
| Tested Device      | Does it work? | Is it practical? | Does it look good? | Final Notes                                  |
|--------------------|---------------|------------------|--------------------|----------------------------------------------|
| iPod Touch 7th Gen | Yes.          | Yes.             | Yes.               | Susdeck was made for the iPod Touch 7th gen  |
| iPhone 12          | Yes.          | Yes.             | Yes.           | No comment |
| Desktop         | Yes.          | No.             | Meh.           | Susdeck is made for touchscreen devices when you can't instantly press a key. |
## Closing Notes
Do not mind the occasional reference to 'Onyx', that is a super not secret codename for Susdeck.
