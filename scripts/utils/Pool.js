var library = require("./Library.js");
var fs = require("fs");
var async = require("async");
var { spawn } = require("child_process");
var taskHome = require("../task/taskHome.js");
var logger = require("../Logger.js");
const jetpack = require('fs-jetpack');
var database = require("./Database.js");

const BRUTE_FORCE_TMP_PATH = 'data/bruteforce/';

module.exports = class Pool {

    constructor(io, logFolderPath) {
        this.allowProcess = 2;
        this.activeProcess = 0;

        this.poolQueue = [];

        this.logFolderPath = logFolderPath;
        this.io = io;
        this.processMap = new Map();
    }

    insertNewTask(data) {
        logger.log("debug", ["Insert new task ", JSON.stringify(data)].join(""));
        var self = this;

        var params = { taskName: data.data.taskName, serverHome: data.data.serverhome, state: taskHome.TaskState.created, taskKey: library.getRandomTextInRange(10) };
        database.connection.query("INSERT INTO task SET ?", params, function (err, result) {
            if (err) {
                console.error(err);
                throw err;
            }
            var idTask = result.insertId;

            async.parallel([
                function (callback) {
                    if (data.data.taskdata.othertab != null) {

                        var params = { state: taskHome.TaskState.created, task_id: idTask, type: taskHome.TaskType.other };
                        database.connection.query("INSERT INTO subTask SET ?", params, function (err, result) {
                            if (err) {
                                console.error(err);
                                throw err;
                            }
                            var idSubTask = result.insertId;

                            var params = { path: self._createLogFile("othertask"), subTask_id: idSubTask };
                            database.connection.query("INSERT INTO log SET ?", params, function (err) {
                                if (err) {
                                    console.error(err);
                                    throw err;
                                }
                            });

                            params = { testPortScan: data.data.taskdata.othertab.data.idTestPortScan, testJavascriptImport: data.data.taskdata.othertab.data.idTestJavascriptImport, testHttpHttps: data.data.taskdata.othertab.data.idTestHttpHttps, testGitConfig: data.data.taskdata.othertab.data.idTestGitConfig, subTask_id: idSubTask };
                            database.connection.query("INSERT INTO otherTask SET ?", params, function (err, result) {
                                if (err) {
                                    console.error(err);
                                    throw err;
                                }
                                if (data.data.taskdata.othertab.data.idTestPortScan === true) {
                                    //is enable port scanning
                                    params = { from: data.data.taskdata.othertab.data.testPortScanData.from, to: data.data.taskdata.othertab.data.testPortScanData.to, otherTask_id: result.insertId };
                                    database.connection.query("INSERT INTO portScan SET ?", params, function (err, result) {
                                        if (err) {
                                            console.error(err);
                                            throw err;
                                        }
                                        callback(null);
                                    });
                                } else {
                                    callback(null);
                                }
                            });
                        });
                    } else {
                        callback(null);
                    }
                },
                function (callback) {
                    if (data.data.taskdata.bruteforcetab != null) {

                        var params = { state: taskHome.TaskState.created, task_id: idTask, type: taskHome.TaskType.bruteForce };
                        database.connection.query("INSERT INTO subTask SET ?", params, function (err, result) {
                            if (err) {
                                console.error(err);
                                throw err;
                            }
                            var idSubTask = result.insertId;

                            var params = { path: self._createLogFile("bruteforcetask"), subTask_id: idSubTask, };
                            database.connection.query("INSERT INTO log SET ?", params, function (err) {
                                if (err) {
                                    console.error(err);
                                    throw err;
                                }
                            });

                            var fileName = [BRUTE_FORCE_TMP_PATH, 'tmp.txt'].join('');
                            jetpack.write(fileName, [data.data.taskdata.bruteforcetab.data.idLoginNames.join('\r\n'), data.data.taskdata.bruteforcetab.data.idLoginPsw.join('\r\n')].join('\r\n\r\n'));

                            params = { subTask_id: idSubTask, loginFormXPathExpr: data.data.taskdata.bruteforcetab.data.idLoginFormXPathExpr, loginNameXPathExpr: data.data.taskdata.bruteforcetab.data.idLoginNameXPathExpr, loginpswXPathExpr: data.data.taskdata.bruteforcetab.data.idLoginpswXPathExpr, testFilePath: fileName, urlLocation: data.data.taskdata.bruteforcetab.data.idUrlLocation };

                            console.log(params);
                            database.connection.query("INSERT INTO bruteforceTask SET ?", params, function (err, result) {
                                if (err) {
                                    console.error(err);
                                    throw err;
                                }
                                callback(null);
                            });
                        });
                    } else {
                        callback(null);
                    }
                }], function (err) {
                    if (err) {
                        console.error(err);
                        throw err;
                    }

                    if (self.activeProcess < self.allowProcess) {
                        self._startProcess(idTask);
                    } else {
                        self.poolQueue.push(idTask);
                    }
                });

        });
    }

    _startProcess(id) {
        var logFileName = "tmp.txt";
        this.activeProcess++;

        var params = [taskHome.TaskState.running, library.getMySQLTime(), id];
        database.connection.query("UPDATE task SET state = ?, startTime = ?  WHERE id = ?", params, function (err) {
            if (err) {
                console.error(err);
                throw err;
            }
        });

        this.io.emit("taskstart", "TASK " + id + " STARTED :-)");

        const process = spawn("node", ["task/Core.js", id], {
            stdio: ["ipc", "pipe", "pipe"]
        });

        this.processMap.set(id, process);

        process.stdout.on("data", (data) => {
            console.log(`stderr: ${data}`);
            this._appendLog(data, logFileName);
            this.io.emit(["detail-", id].join(""), { "data": data.toString('utf8') });

        });

        process.stderr.on("data", (data) => {
            console.log(`stderr: ${data}`);
            this._appendLog("STD ERROR", logFileName);
            this._appendLog(data, logFileName);
        });

        process.on("close", (code) => {
            var taskFinishedState = (code === 0) ? taskHome.TaskState.done : taskHome.TaskState.killed;

            var endTime = library.getMySQLTime();

            var params = [taskFinishedState, endTime, id];
            database.connection.query("UPDATE task SET state = ?, endTime = ? WHERE  id= ? ", params, function (err) {
                if (err) {
                    throw err;
                }
            });

            this.activeProcess--;
            this.processMap.delete(id);
            console.log("Task id: " + id + " closed...");

            this.io.emit("taskdone", { "running": this.activeProcess, "pending": this.poolQueue.length, "taskdone": id, "endTime": endTime });
            this.io.emit("update-overview", { "running": this.activeProcess, "pending": this.poolQueue.length, "taskdone": id, "endTime": endTime });
            if (this.poolQueue.length !== 0) {
                this._startProcess(this.poolQueue.shift());
            }
        });

        process.on("message", (data) => {
            logFileName = data.file;
        });
    }

    _createLogFile(taskname) {
        var file = [this.logFolderPath, "/", "red_face_log_", taskname, "_", Date.now(), "_", library.getRandomTextInRange(), ".txt"].join("");
        this._appendLog("Starting...\n", file);
        return file;
    }

    _appendLog(message, file) {
        fs.appendFileSync(file, message);
    }

    killTask(taskId) {
        var proc = this.processMap.get(taskId);
        if (proc === null) {
            console.log("Proces is empty, err");
            return;
        }

        proc.kill("SIGINT");
    }
};