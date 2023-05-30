# Freedeck

<img src="https://github.com/freedeck/freedeck/blob/dev/src/app/assets/icons/freedeck.png?raw=true" width='100' height='100'>

Freedeck is the FOSS alternative to the Elgato Stream Deck.  
Freedeck has had tons of time put into making the user experience as easy as possible, while staying in the boundaries of **3** (standard) dependencies!

## Join the Discord

You can join the official Freedeck Discord server over at [https://discord.gg/SdA2YfEb6R](https://discord.gg/SdA2YfEb6R)

## What does it look like?

These screenshots were taken on a desktop environment made to look like mobile.
![Freedeck UI preview](https://github.com/freedeck/freedeck/blob/master/demo/preview.png?raw=true)

Here's a preview of the login screen:
![Freedeck Login preview](https://github.com/freedeck/freedeck/blob/master/demo/login.png?raw=true)

Here's a preview of the companion home screen:
![Freedeck Companion Home preview](https://github.com/freedeck/freedeck/blob/master/demo/c-home.png?raw=true)

Here's a preview of the companion soundboard screen:
![Freedeck Companion Home preview](https://github.com/freedeck/freedeck/blob/master/demo/c-sounds.png?raw=true)

And finally, here's a preview of the companion theme screen.
![Freedeck Companion Home preview](https://github.com/freedeck/freedeck/blob/master/demo/c-themes.png?raw=true)

## How do I use Freedeck?

**First, you will need any virtual audio cable (Such as VB-Cable, Freedeck's default)**
Clone the repo, then change `Settings.js.default` to only have it's extension `.js`.  
Next, modify the settings however you want, you can add authentication, a password, and a message for when somebody tries to login to your Freedeck.  

Now, for the fun part. Run `npm run setup` and then `npm run start`.  

Freedeck Companion will open.  
**This is normal!**  
This is how you will configure your Freedeck.  
Now your computer is hosting a server on port 5754 (or your `PORT` in `Settings.js`).  
Freedeck will tell you in the terminal what IP to go to.
Get any device and go to `yourlocalip:5754` in a web browser (for iOS, use Safari for best results).  

## iOS EXCLUSIVE

**You must use Safari for this.**  
Now, add the app to your home screen by pressing the share button.  
Next, open the app on your device. It will be full screen.  
**Freedeck is best used in landscape/horizontal mode.**

## Ok, back to normal

There are preloaded keys, for example `Shooting` will make CoD shooting sounds play through your computer and your VB-Cable.

## How do I make my own sounds/macros?

Freedeck processes keys & plays sounds at the front-end, and it uses robotjs & Companion to press/play them on your computer.  
It is very easy to add your own macros/sounds.  
All you need to do is use Companion!
To add a sound, start Freedeck with `npm run start`.  
Wait for Companion to open, and press the *second* paintbrush icon.  
Now, press `New Sound`. You might need to press `Next Page` to scroll through the pages to find the sound.  
Once you do, click it.  
You are now able to edit the sound path and name. Icon editing will be supported in the future.  

**Make sure that anything in the `Sound Path` is inside of `src/app/assets/sounds` or it will not work!**  
Congratulations, you have added your own sound, all using Freedeck Companion's magic.

## Tested Devices

Freedeck has not had many devices tested on it. For now, these are the officially supported devices.
| Tested Device      | Does it work? | Is it practical? | Does it look good? | Final Notes                                  |
|--------------------|---------------|------------------|--------------------|----------------------------------------------|
| iPod Touch 7th Gen | Yes.          | Yes.             | Yes.               | Freedeck was made for the iPod Touch 7th gen  |
| iPhone 12          | Yes.          | Yes.             | Yes.           | No comment |
| iPhone XR          | Yes.          | Yes.             | Yes.           | No comment |
| Samsung S22+         | Yes.          | Yes.             | Yes.           | You will need to scroll down to "fullscreen" the app. |
| iPad Pro 2nd Gen 10.5" (A10X)          | Yes.          | Yes.             | Yes.           | No comment |
| Desktop         | Yes.          | No.             | Almost.           | Freedeck is made for touchscreen devices when you can't instantly press a key. |

## Tested Desktop Environments

Freedeck (Companion) has not had many OS/Distros/DE/WMs tested on it. Information on how to contribute to testing will be added later. For now, these are the officially supported devices.
| Tested OS/Distro/DE/WM      | Does it work? | Is it practical? | Final Notes                                  |
|--------------------|---------------|------------------|----------------------------------------------|
| OS: Windows 10/11 | Yes.          | Yes.             | No comment  |
| Distro: Arch, DE: `xfce4`          | Yes.          | Yes.             | You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Arch, DE: `lxde`          | Yes.          | Yes.             | You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Arch, DE: `deepin`          | Yes.          | Yes.             | You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Arch, DE: `cutefish`          | Yes.          | Yes.             | You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Arch, DE: `gnome`          | Yes.          | Yes.             | You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Arch, WM: `openbox`          | Yes.          | Yes.             | You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Arch, WM: `i3`          | Yes.          | Yes.             | You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Arch, WM: `Hyprland`          | Yes.          | Yes.             | Wayland WM. You'll need `pulseaudio` or `pipewire` alongside ALSA/`alsa-utils` for audio. Info will be added for VB-Cable alternatives later. |
| Distro: Mint, DE: any         | Yes.          | Yes.             | VB-Cable alternative info will be added later. |
| Distro: Fedora, DE: `gnome`        | Yes.          | Yes.             | VB-Cable alternative info will be added later. |
| Distro: Pop!_OS, DE: `gnome`        | Yes.          | Yes.             | VB-Cable alternative info will be added later. |
| Distro: Ubuntu, DE: `gnome`        | Yes.          | Yes.             | VB-Cable alternative info will be added later. |
