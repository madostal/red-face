var library = require('./Library.js');
var fs = require('fs');

var taskHome = require('../task/taskHome.js');

module.exports = class Pool {

    constructor(io, logFolderPath, db) {
        this.allowProcess = 2;
        this.activeProcess = 0;

        this.poolQueue = [];

        this.db = db.getConnection();
        this.logFolderPath = logFolderPath;
        this.io = io;
    }

    insertNewTask(data) {
        var self = this;

        var params = { taskName: data.data.taskName, state: taskHome.TaskState.created, taskKey: library.getRandomTextInRange(10) };
        this.db.query('INSERT INTO task SET ?', params, function (err, result) {
            if (err) throw err;
            var idTask = result.insertId;

            var params = { state: taskHome.TaskState.created, task_id: idTask, type: taskHome.TaskType.bruteForce };
            self.db.query('INSERT INTO subTask SET ?', params, function (err, result) {
                if (err) throw err;
                var idSubTask = result.insertId;

                var params = { path: self._createLogFile("bruteforcetask"), subTask_id: idSubTask, subTask_task_id: idTask};
                self.db.query('INSERT INTO log SET ?', params, function (err) {
                    if (err) throw err;
                });

                if (data.data.taskdata.bruteforcetab != null) {
                    var params = { loginFormXPathExpr: data.data.taskdata.bruteforcetab.data.idLoginFormXPathExpr, loginNames: data.data.taskdata.bruteforcetab.data.idLoginNames, loginPsw: data.data.taskdata.bruteforcetab.data.idLoginPsw, loginFormLocation: data.data.taskdata.bruteforcetab.data.idLoginFormLocation, subTask_id: idSubTask, subTask_task_id: idTask };
                    console.log(params);
                    self.db.query('INSERT INTO bruteforceTask SET ?', params, function (err, result) {
                        if (err) throw err;

                        //TODO MOVE THIS BLOCK TO ANOTHER SECTION
                        if (self.activeProcess < self.allowProcess) {
                            self._startProcess(idTask);
                        } else {
                            self.poolQueue.push(idTask);
                        }
                    })
                }
            })
        });
    }

    _startProcess(id) {
        var logFileName = "tmp.txt";
        this.activeProcess++;

        var params = [taskHome.TaskState.running, library.getMySQLTime(), id];
        this.db.query('UPDATE task SET state = ?, startTime = ?  WHERE id = ?', params, function (err) {
            if (err) throw err;
        });

        this.io.emit('taskstart', "TASK " + id + " STARTED :-)");

        const { spawn } = require('child_process');

        const process = spawn('node', ['task/Core.js', id], {
            stdio: ['ipc', 'pipe', 'pipe']
        });
        
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
            var endTime = library.getMySQLTime();

            var params = [taskHome.TaskState.done, endTime, id];
            this.db.query('UPDATE task SET state = ?, endTime = ? WHERE  id= ? ', params, function (err) {
                if (err) throw err;
            });

            this.activeProcess--;
            this.io.emit('taskdone', { "running": this.activeProcess, "pending": this.poolQueue.length, "taskdone": id, "endTime": endTime });
            this.io.emit('update-overview', { "running": this.activeProcess, "pending": this.poolQueue.length, "taskdone": id, "endTime": endTime })
            if (this.poolQueue.length != 0) {
                this._startProcess(this.poolQueue.shift());
            }
        });

        process.on('message', data => {
            logFileName = data.file;
        })
    }

    _createLogFile(taskname) {
        var file = [this.logFolderPath, "/", "red_face_log_", taskname, "_", Date.now(), "_", library.getRandomTextInRange(), ".txt"].join("");
        this._appendLog("Starting...\n", file);
        return file;
    }

    _appendLog(message, file) {
        // console.log("Appending msg: " + message + " to file: " + file);
        fs.appendFileSync(file, message);
    }
}