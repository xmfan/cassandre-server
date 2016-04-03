var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/android-simulator', function(req, res){
  res.sendFile(__dirname + '/public/android-simulator.html');
});

var dashboard = io
	.of('/dashboard')
	.on('connection', function(socket){
		console.log('a user connected');
	});

var bufferObj = {};
var android;
android = io
	.of('/android')
	.on('connection', function(socket){
    var ip;
		console.log('an android device has connected');
		socket.on('alert-location', function(ip, lat, lng){//alert-noise and alert-location
			//console.log('an android device has submitted an alert');
			console.log(ip+': '+lat+', ' + lng);
			dashboard.emit('map-update', {id: ip, lat: lat, lng: lng});
		});

    socket.on('alert-noise', function(ip, lat, lng, dB){
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
        for (var key in bufferObj) {
          delete(bufferObj[key]);
        }
      }
    });
    socket.on('disconnect', function(message){
      console.log(ip);
			console.log('android disconnected');
			dashboard.emit('remove-marker', ip);
		});
	});

app.get('/evacuate', function(req, res) {
  android.emit('alert-evacuate');
  res.sendStatus(200);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
