var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var Pool = require('./utils/pool.js');
  var poolInstance = new Pool(io);




app.use(express.static(__dirname + '/node_modules'));
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(4200);

io.on('connection', function (socket) {



  console.log('a user connected: ' + socket.id + "\n");

  socket.on('disconnect', function () {
    console.log(socket.name + ' has disconnected from the chat.' + socket.id + "\n");
  });

  socket.on('join', function (name) {
    socket.name = name;
    console.log(socket.name + ' joined the chat.' + "\n");
  });

  socket.on('message', function (name) {
    socket.name = name;
    console.log(socket.name + ' joined the chat.' + "\n");
  });



  /**
   * On create new task
   */
  socket.on('taskcreate', function (input) {
    var json = JSON.parse(input);
    io.emit('taskcreate', json.data.taskname);
    poolInstance.startNewTask(iterator++);
  });

  var iterator = 0;
});



