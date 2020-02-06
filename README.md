# Home Assistant Configuration

[Hass.io](https://home-assistant.io/) installed on a [Raspberry Pi 3 Model B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/) and running on a wall mounted tablet displaying Home Assistant in and on desktop [applicationize](https://applicationize.me/) (chrome).

If you like anything here, Be sure to :star2: my repo!

## Features

* Dynamic 3D Floorplan: Hue and Brightness mapped individual lights with custom popup controller.
* Less cluttered interface displaying [more information](https://github.com/thomasloven/hass-browser_mod#popup) on a [long press](https://www.home-assistant.io/lovelace/picture-elements/#hold_action), inspired by [Mattias Persson](https://github.com/matt8707/hass-config).
* Custom rain card to display predicted rain in the next 2 hours - [seperate repo here](https://github.com/lukevink/home-assistant-buienradar-forecast-card)
* Custom Xiaomi View for rapid room based zone cleanup

## Approach & Picture-Elements Styling

This approach is heavily based on the [Picture Elements Card](https://www.home-assistant.io/lovelace/picture-elements/) for each view, and does not work in a traditional "Card" based way. Most cards include a heavy amount of styling and positioning. Some of this styling overrides the custom cards to use [View Width](https://css-tricks.com/fun-viewport-units/) so that their fonts, widths and heights scale according to the width of the display, so that I can use my interface on any resolution.

I first designed my whole UI in [Pixelmator](https://www.pixelmator.com/) so that I could export the button images and Xiaomi floorplan overlay images.

## The sidebar & Views

Note, the sidebar is repeated across every view in the lovelace.yaml file.

* Time and date with greeting based on time of day.
* Lights and switches that are on, using natural language.
* Temperature with emojis based on weather conditions.
* Important calendar information.
* Time since a person left home.

## Hardware in my Home

* Xgimi H1 PROJECTOR
* Sound system (controlled by an IR Blaster)
* Philips Hue Bulbs
* Osram Garden Poles (used for roof, outdoors)
* Xiaomi Mi Robot
* Philips motion sensors

## Individual hue & brightness lights

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
