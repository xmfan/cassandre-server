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
		console.log('an android device has connected');
		socket.on('alert', function(position){
			console.log('an android device has submitted an alert');
			dashboard.emit('map-update', position);
		});
	});

// {lng:-74.6526860,lat:40.3503270}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
