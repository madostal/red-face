const LOG_FOLDER = './log_folder';

var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var database = require('./utils/Database.js');
var databaseInstance = new database();

var pool = require('./utils/pool.js');
var poolInstance = new pool(io, LOG_FOLDER, databaseInstance);

server.listen(4200);
serverSetUp()

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
    poolInstance.insertNewTask(json.data.taskname);
  });

  /**
   * Return all tasks
   */
  socket.on('give-me-tasks', function (input) {
    databaseInstance.executeSelectSql("SELECT * FROM task", [], thereAreTasksCallback)
  });

  /**
   * Emit via websocket tasks from database
   *
   * @param {array} field
   */
  var thereAreTasksCallback = function (field) {
    io.emit('there-are-tasks', field);
  }

  socket.on('give-me-task-detail', function (input) {
    var splitKey = input.key.split("_");
    console.log(input);
    console.log(splitKey.length);
    console.log(splitKey)
    if(splitKey.length != 2) {
      //possible wrong key
      thereIsTaskDetailCallback({});
    } else {
      databaseInstance.executeSelectSql("SELECT * FROM TASK WHERE ID = ? AND TASKKEY = ?", [splitKey[0], splitKey[1]], thereIsTaskDetailCallback);
    }
  });

  var thereIsTaskDetailCallback = function (field) {
    console.log(field)
    io.emit('there-is-task-detail', field);
  }
});