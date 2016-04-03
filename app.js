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

var android = io
	.of('/android')
	.on('connection', function(socket){
    var ip;
		console.log('an android device has connected');
		socket.on('alert-location', function(ip, lat, lng){//alert-noise and alert-location
			console.log('an android device has submitted an alert');
			console.log(ip+': '+lat+', ' + lng);
			dashboard.emit('map-update', {id: ip, lat: lat, lng: lng});
		});
    socket.on('alert-noise', function(lat, lng){
      console.log(lat + lng);
      var noise = {lat:lat, lng:lng}
      dashboard.emit('noise-update', noise);
    });
    socket.on('disconnect', function(message){
      console.log(ip);
			console.log('android disconnected');
			dashboard.emit('remove-marker', ip);
		});
	});

// {lng:-74.6526860,lat:40.3503270}
// event type: alert-evacuate

http.listen(3000, function(){
  console.log('listening on *:3000');
});
