# Watchr
Find the Android component [here](https://github.com/marwanad/Watchr).
Binaural sound backtracking algorithm implementation WIP on [algo-v2](https://github.com/xmfan/cassandre-server/tree/algo-v2) branch

## Inspiration
In light of recent events such as the Paris, Brussels and Lahore attacks, people are uneasy about crowded public spaces. Having watched a few interviews after the Brussels incident and noticed that most people did not know how to react in such situations. Watchr is a web application which uses connected mobile devices to gather information on a wi-fi network. The mobile application component is mostly a background service (to collect data on surroundings) with simplistic UI which allows simple messages to be transmitted to said devices (such as evacuation instructions).

## What it does
Watchr uses the often publicly available wi-fi in crowded spaces in order to connect mobile devices to security authorities. Watchr runs in the phone's background and tracks the device's location as well as the nearby sound levels. Watchr uses spikes in ambient noise to identify suspicious activity and determines their coordinates using an adapted algorithm of the inverse square law for sound and triangulation. The web application displays the coordinates of all devices connected to the wi-fi network and the coordinates of suspiciously loud noises on a map. From the browser, security authorities are able to send alerts such as evacuation directives (route optimized by the device's coordinates) to each connected device.

## Screenshots
#### Android
<img src="https://raw.githubusercontent.com/marwanad/Watchr/master/screenshots/1.png " width="300"/>
<img src="https://raw.githubusercontent.com/marwanad/Watchr/master/screenshots/2.png " width="300"/>
<img src="https://raw.githubusercontent.com/marwanad/Watchr/master/screenshots/3.png " width="300"/>
<img src="https://raw.githubusercontent.com/marwanad/Watchr/master/screenshots/5.png " width="300"/>
<img src="https://raw.githubusercontent.com/marwanad/Watchr/master/screenshots/4.png " width="340" />
#### Web
<img src="https://raw.githubusercontent.com/marwanad/Watchr/master/screenshots/6.png" />
