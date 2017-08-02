const LOG_FOLDER = './log_folder';

var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var pool = require('./utils/pool.js');
var poolInstance = new pool(io, LOG_FOLDER);

var database = require('./utils/Database.js');
var databaseInstance = new database();

server.listen(4200);

function serverSetUp() {
  if (!fs.existsSync(LOG_FOLDER)) {
    fs.mkdirSync(LOG_FOLDER);
  }
}

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

serverSetUp();


