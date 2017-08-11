'use strict';

var library = require('./Library.js');
var fs = require('fs');

var taskHome = require('../task/taskHome.js');

module.exports = class Pool {

    constructor(io, logFolderPath, db) {
        this.allowProcess = 2;
        this.activeProcess = 0;
        this.poolQueue = [];

        this.db = db;
        this.logFolderPath = logFolderPath;
        this.io = io;
    }

    insertNewTask(taskName) {
        var self = this;
        this.db.executeNonSelectSql("INSERT INTO task SET ?", { taskName: taskName, state: taskHome.TaskState.created }, function (id) {
            if (self.activeProcess < self.allowProcess) {
                self._startProcess(id);
            } else {
                self.poolQueue.push(id);
            }
        });
    }

    _startProcess(id) {
        var logFileName = this._createLogFile();
        this.activeProcess++;

        this.db.executeNonSelectSql("UPDATE task SET state = ?, startTime = ?  WHERE id = ?", [taskHome.TaskState.running, library.getMySQLTime(), id], null);

        this.io.emit('taskstart', "TASK " + id + " STARTED :-)");

        const { spawn } = require('child_process');

        const process = spawn('node', ['utils/tester.js', id]);

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            this._appendLog(data, logFileName);
        });

        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            this._appendLog("STD ERROR", logFileName);
            this._appendLog(data, logFileName);
        });

        process.on('close', (code) => {
            this.db.executeNonSelectSql("UPDATE task SET state = ?, endTime = ? WHERE  id= ? ", [taskHome.TaskState.done, library.getMySQLTime(), id], null);

            this.activeProcess--;
            this.io.emit('taskdone', { "running": this.activeProcess, "pending": this.poolQueue.length });
            this.io.emit('update-overview', { "running": this.activeProcess, "pending": this.poolQueue.length })
            if (this.poolQueue.length != 0) {
                this._startProcess(this.poolQueue.shift());
            }
        });
    }

    _createLogFile() {
        var file = [this.logFolderPath, "/", "red_face_log_", Date.now(), "_", library.getRandomTextInRange(), ".txt"].join("");
        this._appendLog("Starting...\n", file);
        return file;
    }

    _appendLog(message, file) {
        console.log("Appending msg: " + message + " to file: " + file);
        fs.appendFileSync(file, message);
    }
}

