var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var dashboard = io
	.of('/dashboard')
	.on('connection', function(socket){
		console.log('Dashboard: Connection Established');
	});

var bufferObj = {};
var android;
android = io
	.of('/android')
	.on('connection', function(socket) {
    var ip;
		console.log('Android: Connection Established');

    // Periodically update connected devices' location on the Dashboard
		socket.on('alert-location', function(ip, lat, lng) {
			console.log(ip + ': ' + lat + ', ' + lng);
			dashboard.emit('map-update', {id: ip, lat: lat, lng: lng});
		});

    // TODO: Rewrite Algorithm
    // Suspicious noise is detected and the server is alerted
    socket.on('alert-noise', function(ip, lat, lng, dB) {
      bufferObj[ip] = {
        lat: lat,
        lng: lng,
        dB: dB
      };

      var noise = {
        lat: 0,
        lng: 0
      };

      var count = 0;
      for (var ip in bufferObj) {
        noise.lat += bufferObj[ip].lat;
        noise.lng += bufferObj[ip].lng;
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
        for (var key in bufferObj) {
          delete(bufferObj[key]);
        }
      }
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
