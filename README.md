# Freedeck

<img src="https://github.com/freedeck/freedeck/blob/dev/src/app/assets/icons/freedeck.png?raw=true" width='100' height='100'>

Freedeck is the FOSS alternative to the Elgato Stream Deck.  

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b18dd7c07b464827a367c50b263bc039)](https://app.codacy.com/gh/Freedeck/Freedeck/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![Discord](https://img.shields.io/discord/1077430225874468975)
![GitHub Repo stars](https://img.shields.io/github/stars/Freedeck/Freedeck)
![GitHub all releases](https://img.shields.io/github/downloads/Freedeck/Freedeck/total)

## Join the Discord

You can join the official Freedeck Discord server over at [https://discord.gg/SdA2YfEb6R](https://discord.gg/SdA2YfEb6R)

## What does it look like?

These screenshots were taken on the iPod Touch 7th gen.
![Freedeck UI preview](https://github.com/freedeck/freedeck/blob/master/demo/preview.jpg?raw=true)

Here's a preview of the login screen:
![Freedeck Login preview](https://github.com/freedeck/freedeck/blob/master/demo/preview-login.jpg?raw=true)

Here's a preview of the companion home screen:
![Freedeck Companion Home preview](https://ifarded.lol/captures/Screenshot@2023_07_22_09_21_83904.png)

Here's a preview of the companion theme screen:
![Freedeck Companion Home preview](https://ifarded.lol/captures/Screenshot@2023_07_22_09_21_69019.png)

Here's a preview of the companion soundboard screen:
![Freedeck Companion Home preview](https://ifarded.lol/captures/Screenshot@2023_07_22_09_21_11365.png)

Here's a preview of the companion icon editor screen:
![Freedeck Companion Home preview](https://ifarded.lol/captures/Screenshot@2023_07_22_09_21_57364.png)

Here's a preview of the companion settings screen:
![Freedeck Companion Home preview](https://ifarded.lol/captures/Screenshot@2023_07_22_09_22_45142.png)

Here's a preview of the companion experiments screen:
![Freedeck Companion Home preview](https://ifarded.lol/captures/Screenshot@2023_07_22_09_22_79888.png)

## How do I use Freedeck?

**First, you will need any virtual audio cable (Such as VB-Cable, Freedeck's default)**
Now, clone the repo. Run `npm run setup` for an interactive setup experience.  
From there, whenever you're ready, run `npm start` (or `npm run start`).

Freedeck Companion will open.  
**This is normal!**  
This is how you will configure your Freedeck.  
Now your computer is hosting a server on port 5754 (or the port you inputted during setup).  
Freedeck will tell you in the terminal what IP to go to.
Get any device and go to `yourLocalIP:5754` in a web browser (for iOS, use Safari for best results).  
Now, add the app to your home screen by pressing the share button.  

Next, open the app on your device. It will be full screen.  
**Freedeck is best used in landscape/horizontal mode.**

## Ok, back to normal

There are no preloaded keys, for example `Shooting` will make CoD shooting sounds play through your default output device and your VB-Cable.

## How do I make my own sounds/macros?

Freedeck processes keys & plays sounds at the front-end, and it uses `robotjs` & Companion to press/play them on your computer.  
It is very easy to add your own macros/sounds.  
All you need to do is use Companion!
To add a sound, start Freedeck with `npm run start`.  
Wait for Companion to open, and press the paint palette icon.  
Now, press `New Sound`. You might need to press `Next Page` to scroll through the pages to find the sound.  
Once you do, click it.  
You are now able to edit the sound path and name.

**Make sure that anything in the `Sound Path` is inside of `src/app/assets/sounds` or it will not work!**  
Congratulations, you have added your own sound, all using Freedeck Companion's magic.

## Theming?

Freedeck themes are under the paint bucket icon in Companion.  
You can export and import custom themes, or use the provided ones.  
An example of custom theme code is:  

```js
"[{\"icon-count\":8},{\"template-columns\":\"repeat(4,1fr)\"},{\"background-size\":\"400% 400%\"},{\"font-family\":\"Rubik, sans-serif\"},{\"background\":\"45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%\"},{\"modal-color\":\"rgba(0, 179, 255, 1)\"}]"
```

Each CSS rule is a JSON object in an array.  
However, `icon-count` and `modal-color` are custom.  
`modal-color` relates to the icon editing modal in Companion.  
`icon-count` relates to the amount of icons on your screen. You may need to adjust `template-columns` after to see those icons.  
Remember that Freedeck puts 3 icons (Stop All, Reload, Icon), so set it to however many icons you want, subtracted by 3.

## Tested Devices

Freedeck has not had many devices tested on it. For now, these are the officially supported devices.
| Tested Device      | Does it work? | Is it practical? | Does it look good? | Final Notes                                  |
|--------------------|---------------|------------------|--------------------|----------------------------------------------|
| iPod Touch 7th Gen | Yes.          | Yes.             | Yes.               | Freedeck was made for the iPod Touch 7th gen  |
| iPhone 12          | Yes.          | Yes.             | Yes.           | No comment |
| iPhone XR          | Yes.          | Yes.             | Yes.           | No comment |
| Acer Iconia Tab 8  | Yes.       | Yes.       | Yes.        | No comment |
| Samsung S22+         | Yes.          | Yes.             | Yes.           | No comment |
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
