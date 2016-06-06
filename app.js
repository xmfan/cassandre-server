'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Coordinate = require('./classes/Coordinate.js');
const Alert = require('./classes/Alert.js');
var tracing = false;

// Sound
const SoundSource = function(lat, lng, W) {
  this.coord = new Coordinate(lat, lng);
  this.power = W;
}

// TODO: cluster sound events
// HashMap{Timestamp => Alert}
const alertMap = new Map();

const dashboard = io
  .of('/dashboard');

const android = io
  .of('/android')
  .on('connection', function(socket)
  {
    // Periodically update connected devices' location on the Dashboard
    socket.on('alert-location', function(ip, lat, lng)
    {
      dashboard.emit('map-update', {id: ip, lat: lat, lng: lng});
    });

    // Alert the server when suspicious sound level is detected
    socket.on('alert-noise', function(ip, lat, lng, dB)
    {
      socket.emit('alert-location', ip, lat, lng);

      const key = getCurrentTimestamp();
      alertMap.set(key, new Alert(lat, lng, dB, key, alertMap));
      // TODO: push alert to database

      // TODO: replace global flag with node events
      if (!tracing && alertMap.size > 1) {
        const source = getSourceCoordinates(alertMap);
        // TODO: log source to database

        dashboard.emit('noise-update', source);
        android.emit('alert-map', source);
      }
    });

    // Removes the disconnected devices' location marker
    socket.on('disconnect', function(ip, message)
    {
      dashboard.emit('remove-marker', ip);
    });
  });


// TODO: Put in Seperate files
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/android-simulator', function(req, res) {
  res.sendFile(__dirname + '/public/android-simulator.html');
});

// Send evacuation instructions to all connected devices
app.get('/evacuate', function(req, res) {
  android.emit('alert-evacuate');
  res.sendStatus(200);
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

/*
** Helper functions
*/
function getCurrentTimestamp() {
  return new Date().getTime();
}

function ascendingTimestamp(a, b) {
  if (a.timestamp < b.timestamp) return -1;
  if (a.timestamp > b.timestamp) return 1;
  return 0;
}

// returns distance in meters between 2 Coordinate objects
function cDistance(a, b){
  const EARTH_RADIUS = 6378.137; // Radius of earth in KM
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const c = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1-c));
  const e = EARTH_RADIUS * d;
  return e * 1000;
}

// Estimation Algorithm revolves on Interaural Time Difference and Interaural Level Difference
// Assumptions:
//   1) all alerts in alertsMap at a certain time are originating from the same sound source
//   2) the lower the timestamp, the closer the alert's coordinate is to the sound source (applying Interaural Time Difference)
//   3) near no reflections nor reverberation in open spaces (applying Inverse Square Law for Sound)
//   4) inteference of noise does not affect sound speed
//   5) the open space is at the sea level of a WGS84 spheroid-shaped Earth, simplifying computations of distance between coordinates
function getSourceCoordinates(map) {
  tracing = true;
  const SOUND_SPEED = 336; // speed of sound in NTP conditions, in meters per second

  // shallow copy of self-destructing alerts in map of alerts
  // TODO: replace this with fail-safe query by timestamp key
  var alerts = new Array();
  for (var alert of map.values()) {
    alerts.push(alert);
  }
  alerts.sort(ascendingTimestamp);

  // Step 1. Convert intensity from dB to W/m^2
  // intensity(W/m^2) = threshold of hearing(W/m^2) * 10^(1/10 * intensity(dB)), where threshold of hearing(W/m^2) = 10^(-12)
  for (var i=0; i<alerts.length; i++) {
    alerts[i].intensity = 10^(-12) * 10^(alerts[i].dB/10);
  }

  // Array of all possible sound source Coordinate objects
  var possibleSources = new Array();

  // Step 2. Using speed of sound and Interaural Time Difference
  for (var i=0; i<alerts.length; i++) {
    const a = alerts[i];
    for (var j=i+1; j<alerts.length; j++) {
      const b = alerts[j];
      const time = b.timestamp - a.timestamp;
      const projdist = time * SOUND_SPEED; // distance between scalar projection of a on b and b, in meters
      const dist = cDistance(a.coord, b.coord); // distance between a and b, in meters

      // Step 3. Apply Inverse Square Law
      // minimize dist by moving a's coordinates along the circumference of the circle centered at the sound source (SS)
      // use the maximum of the derivative of the distance function, with respect to the angle between vectors from SS to a and from SS to b
      var somelat, somelng, someWatt; // WIP
      const source = new SoundSource(somelat, somelng, someWatt);
      possibleSources.push(source);
    }
  }

  // Step 4. determine correctSource from possibleSources
  var correctSource; // WIP

  tracing = false;
  return correctSource;
}
