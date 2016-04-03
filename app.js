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
			console.log(ip+': '+lng+', ' + lat);
			dashboard.emit('map-update', {id: ip, lng: lng, lat: lat}); 
		});
    socket.on('alert-noise', function(ip, dB){
      console.log(ip + ' ' + dB);
      //dashboard.emit('map-update', data.position);
      dashboard.emit('noise-update', {ip: ip, volume: dB});
    });
    socket.on('disconnect', function(message){
      console.log(ip);
			console.log('android disconnected');
			dashboard.emit('remove-marker', ip);
		});
	});

// {lng:-74.6526860,lat:40.3503270}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
