'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// HashMap<Timestamp, Alert>
var deviceMap = {};

// TODO: move classes to other files
// Device coordinates which destroys map[key] after 3 seconds
var Alert = function(lat, lng, dB, map, key) {
	this.lat = lat;
	this.lng = lng;
	this.dB = dB;
	this.timerID = (function() {
		return setTimeout(selfDestruct, 3000);

		function selfDestruct() {
			delete map[key];
		}
	})();
};

var SoundSource = function(lat, lng) {
	this.lat = lat;
  this.lng = lng;
};

var dashboard = io
	.of('/dashboard')
	.on('connection', function(socket) {
		console.log('Dashboard: Connection Established');
	});

var android;
android = io
	.of('/android')
	.on('connection', function(socket) {
		console.log('Android: Connection Established');

		var ip;
		// Periodically update connected devices' location on the Dashboard
		socket.on('alert-location', function(ip, lat, lng) {
			ip = ip;
			dashboard.emit('map-update', {id: ip, lat: lat, lng: lng});
		});

    // TODO: Rewrite Algorithm
		// Alert the server when a suspicious noise is detected
    socket.on('alert-noise', function(lat, lng, dB) {
			function getCurrentTimestamp() {
				return new Date().getTime();
			}

			var key = getCurrentTimestamp();
			deviceMap[key] = new Alert(lat, lng, dB, deviceMap, key);

			/*
      var noise = new SoundSource(0, 0);

      var count = 0;
      for (var ip in deviceMap) {
        noise.lat += deviceMap[ip].lat;
        noise.lng += deviceMap[ip].lng;
        count++;
      }
      noise.lat /= count;
      noise.lng /= count;
      console.log(noise);

      if (count > 2) {
        console.log('3 ip in the buffer');
        dashboard.emit('noise-update', noise);
        // emit coordinates to android
        android.emit('alert-map', noise);
        for (var key in deviceMap) {
          delete(deviceMap[key]);
        }
      }
			*/
    });


    socket.on('disconnect', function(message) {
      console.log(ip);
			console.log('Android: Connection Closed');
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
