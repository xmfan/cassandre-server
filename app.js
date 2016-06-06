'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Coordinate = require('./classes/Coordinate.js');
const Alert = require('./classes/Alert.js');
var tracing = false;

// HashMap{ip => Alert}
const alertMap = new Map();

// Socket Namespace: dashboard
const dashboard = io
  .of('/dashboard')
  .on('connection', function(socket)
  {
    console.log('[DASHBOARD] Connection Established');
  });

// Socket Namespace: android
const android = io
  .of('/android')
  .on('connection', function(socket)
  {
    var id;

    // Periodically update connected devices' location on the Dashboard
    socket.on('alert-location', function(ip, lat, lng)
    {
      if (!id) id = ip;
      console.log('[LOCATION] ' + ip + ': ' + lat + ', ' + lng);
      dashboard.emit('map-update', {id: ip, lat: lat, lng: lng});
    });

    // Suspicious noise is detected and the server is alerted
    socket.on('alert-noise', function(ip, lat, lng, dB)
    {
      console.log('[NOISE] ' + ip + ': ' + lat + ', ' + lng);
      alertMap.set(ip, new Alert(lat, lng, dB, ip, alertMap));

      if (!tracing && alertMap.size > 2) {
        const source = getSourceCoordinates(alertMap);
        console.log('[SOURCE] ' + source.lat + ' ' + source.lng);

        dashboard.emit('noise-update', source);
        android.emit('alert-map', source);
      }
    });

    socket.on('disconnect', function(message)
    {
      console.log('[ANDROID] Connection Closed for ' + id);
      dashboard.emit('remove-marker', id);
    });

  });

function ascendingDecibel(a, b) {
  if (a.dB < b.dB) return -1;
  if (a.dB > b.dB) return 1;
  return 0;
}

// traces sound source by weighted coordinate average
// assume latitude and longitude can be added
function getSourceCoordinates(map) {
  tracing = true;
  // shallow copy of self-destructing alerts in map of alerts
  var alerts = [];
  for (const alert of map.values()) {
    alerts.push(alert);
    map.delete(alert.ip);
  }
  alerts.sort(ascendingDecibel);

  // Distance from the source doubles  <=> intensity drops by 6 dB
  // ie: distance between source and 80 dB = 2*distance between source and 74 dB
  // set all ratios relative to furthest alert
  var weights = [1];
  var weightSum = 1;
  for (var i=1; i<alerts.length; i++) {
    // if alerts[0] is 1 distance away, then alerts[i] is 'ratio' distance away
    const ratio = 1 / ((alerts[i].dB - alerts[0].dB) / 3);
    weights[i] = ratio;
    weightSum += ratio;
  }

  var source = new Coordinate(0, 0);
  for (var k=0; k<weights.length; k++) {
    source.addToThis(alerts[k].coord, weights[k] / weightSum);
  }
  tracing = false;
  return source;
}



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
