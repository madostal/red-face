const LOG_FOLDER = './log_folder';

var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var server = require('http')
  .createServer(app);
var io = require('socket.io')(server);

var database = require('./utils/Database.js');
var databaseInstance = new database();
var pool = require('./utils/pool.js');
var poolInstance = new pool(io, LOG_FOLDER, databaseInstance);

var taskHome = require('./task/TaskHome.js')
var library = require('./utils/Library.js');

server.listen(4200);

/**
 * Create directory for storings logs
 */
function serverSetUp() {
  if (!fs.existsSync(LOG_FOLDER)) {
    fs.mkdirSync(LOG_FOLDER);
  }
}

/**
 * After reset server (if was some fail :-( ) its need check task which were in progress when server fails
 * 
 * So set this task to failed state
 */
function checkDeadTasks() {
  var params = [taskHome.TaskState.failed, library.getMySQLTime(), taskHome.TaskState.done];
  databaseInstance.getConnection().query('UPDATE task SET state = ?, endTime = ? WHERE id IN (SELECT task_id FROM subTask WHERE STATE != ?) ', params, function (err) {
    if (err) throw err;
  });

  databaseInstance.getConnection().query('UPDATE subTask SET state = ?, endTime = ? WHERE STATE != ?', params, function (err) {
    if (err) throw err;
  });
}

io.on('connection', function (socket) {

  /**
   * On create new task
   */
  socket.on('taskcreate', function (input) {
    var json = JSON.parse(input);
    io.emit('taskcreate', json.data.taskname);
    poolInstance.insertNewTask(json);
  });

  /**
   * Return all tasks
   */
  socket.on('give-me-tasks', function (input) {
    databaseInstance.getConnection().query('SELECT * FROM task', [], function (err, fields) {
      if (err) throw err;
      io.emit('there-are-tasks', fields);
    });
  });

  socket.on('give-me-task-detail', function (input) {
    var splitKey = input.key.split("_");
    console.log(input);
    console.log(splitKey.length);
    console.log(splitKey)
    if (splitKey.length != 2) {
      //possible wrong key
      thereIsTaskDetailCallback({});
    } else {
      var params = [splitKey[0], splitKey[1]];
      databaseInstance.getConnection().query('SELECT * FROM TASK WHERE ID = ? AND TASKKEY = ?', params, function (err, fields) {
        if (err) throw err;
        io.emit('there-is-task-detail', fields);
      });
    }
  });

  socket.on('remove-task', function (input) {
    var params = [input.id];
    databaseInstance.getConnection().query('DELETE FROM TASK WHERE ID = ?', params, function (err) {
      if (err) throw err;
    });
  });
});

serverSetUp();
checkDeadTasks();