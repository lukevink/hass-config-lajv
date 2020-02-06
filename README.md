# Home Assistant Configuration

[Hass.io](https://home-assistant.io/) installed on a [Raspberry Pi 3 Model B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/) and running on a wall mounted tablet displaying Home Assistant in and on desktop [applicationize](https://applicationize.me/) (chrome).

![screen.png](https://github.com/lukevink/hass-config-lajv/blob/master/previews/lajv-ha-lights.gif?raw=true)
![screen.png](https://github.com/lukevink/hass-config-lajv/blob/master/previews/lajv-ha-other.gif?raw=true)

## Features

* Dynamic 3D Floorplan: Hue and Brightness mapped individual lights with custom popup controller.
* Less cluttered interface displaying [more information](https://github.com/thomasloven/hass-browser_mod#popup) on a [long press](https://www.home-assistant.io/lovelace/picture-elements/#hold_action), inspired by [Mattias Persson](https://github.com/matt8707/hass-config).
* Custom rain card to display predicted rain in the next 2 hours - [seperate repo here](https://github.com/lukevink/home-assistant-buienradar-forecast-card)
* Custom Xiaomi View for rapid room based zone cleanup



## Approach & Picture-Elements Styling

This approach is heavily based on the [Picture Elements Card](https://www.home-assistant.io/lovelace/picture-elements/) for each view, and does not work in a traditional "Card" based way. Most cards include a heavy amount of styling and positioning. Some of this styling overrides the custom cards to use [View Width](https://css-tricks.com/fun-viewport-units/) so that their fonts, widths and heights scale according to the width of the display, so that I can use my interface on any resolution.

I first designed my whole UI in [Pixelmator](https://www.pixelmator.com/) so that I could export the button images and Xiaomi floorplan overlay images.



## The sidebar

Note, the sidebar is repeated across every view in the lovelace.yaml file and includes buttons for the views.

* Control Rooms: Tap a room to turn on or off all lights, hold tap to show custom controls.
* Control Lights: Tap a light icon to turn on or off individual lights, hold tap to show custom controls.
* Cleanup: Direct control of Xiaomi Mi robot and preset zones for room based cleanup
* All Devices: Show all devices in a familiar homekit UI, why not?
* Media: Button shows currently playing media, if playing, view shows relevant views for Plex or Spotify.
* Weather: Shows weather forecast and predicted rain from Buienradar.



## Hardware in my Home

* Xgimi H1 PROJECTOR
* Sound system (controlled by an IR Blaster)
* Philips Hue Bulbs
* Osram Garden Poles (used for roof, outdoors)
* Xiaomi Mi Robot
* Philips motion sensors



## Individual hue & brightness lights

![screen.png](https://github.com/lukevink/hass-config-lajv/blob/master/previews/mapped-lights-info1.png?raw=true)

Individual Lights:
To have multiple lights overlayed on top of each other, the solution is actually pretty simple. You render an image for each individual light and use the CSS property filter mix-blend-mode: lighten. This will make sure only the “light” part of the image is shown, and will blend together any amount of images on top.

Hue and Opacity
To map one of your light images to the actual live RGB color of the bulb, you can use the following CSS template style which will adjust the hue rotation to the hue of the bulb (in this case, light.table):
```yaml
style:
  filter: '${ "hue-rotate(" + (states[''light.table''].attributes.hs_color ? states[''light.table''].attributes.hs_color[0] : 0) + "deg)"}'
```
OR, include saturation (I found it buggy):

```yaml
style:
  filter: '${ "hue-rotate(" + (states[''light.table''].attributes.hs_color ? states[''light.table''].attributes.hs_color[0] : 0) + "deg) saturate(" + (states[''light.table''].attributes.hs_color ? states[''light.table''].attributes.hs_color[1] : 100)+ "%)"}'
```

To map opacity to the entity’s brightness, use this css template:

```yaml
style:
  opacity: '${ states[''light.table''].attributes.brightness / 255 }'
```
