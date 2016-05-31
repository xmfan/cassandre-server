# cassandre-server
Server for the [Watchr](https://github.com/marwanad/Watchr) app

# Inspiration
In light of recent events such as the Paris, Brussels and Lahore attacks, people are uneasy about crowded public spaces. Having watched a few interviews after the Brussels incident and noticed that most people did not know how to react in such situations. Watchr is a web application which uses connected mobile devices to gather information on a wi-fi network. The mobile application component is mostly a background service (to collect data on surroundings) with simplistic UI which allows simple messages to be transmitted to said devices (such as evacuation instructions).

# What it does
Watchr uses the often publicly available wi-fi in crowded spaces in order to connect mobile devices to security authorities. Watchr runs in the phone's background and tracks the device's location as well as the nearby sound levels. Watchr uses spikes in ambient noise to identify suspicious activity and determines their coordinates using an adapted algorithm of the inverse square law for sound. The web application displays the coordinates of all devices connected to the wi-fi network and the coordinates of suspiciously loud noises on a map. From the browser, security authorities are able to send alerts such as evacuation directives (route optimized by the device's coordinates) to each connected device.

# How we built it
By leveraging the power of friendship.

# Challenges we ran into
Aggregating and synchronizing data from multiple sockets and namespaces, understanding wave physics academic papers, and pinpointing sound origin locations using relative distance, sound levels and approximations.

# Accomplishments that we're proud of
Figured out how to aggregate data from multiple sockets (by also using REST), greatly limiting false positives of suspicious activities (by setting tested thresholds)

# What we learned
Teamwork, delegation, sockets and synchronizing sockets, sound intensity drops by 6dB when the distance from the source doubles.

# What's next for Watchr
Refining our sound pinpointing algorithm, optimizing evacuation route pathing, predictive analysis.
