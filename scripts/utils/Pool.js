'use strict';

var library = require('./Library.js');
var fs = require('fs');

module.exports = class Pool {

    constructor(io, logFolderPath) {
        this.allowProcess = 2;
        this.activeProcess = 0;
        this.poolQueue = [];
        this.logFolderPath = logFolderPath;
        this.io = io;
    }

    startNewTask(id) {
        if (this.activeProcess < this.allowProcess) {
            this.startProcess(id);
        } else {
            this.poolQueue.push(id);
        }
    }

    startProcess(id) {
        var logFileName = this.createLogFile();
        this.activeProcess++;
        this.io.emit('taskstart', "TASK " + id + " STARTED :-)");

        const { spawn } = require('child_process');

        const process = spawn('node', ['utils/tester.js', id]);

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            this.appendLog(data, logFileName);
        });

        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            this.io.emit('taskdone', "TASK DONE :-)");
            //possible critical section ??
            this.activeProcess--;
            if (this.poolQueue.length != 0) {
                this.startProcess(this.poolQueue.shift());
            }
        });
    }

    createLogFile() {
        var file = [this.logFolderPath, "/", "red_face_log_", Date.now(), "_", library.getRandomTextInRange(), ".txt"].join("");
        this.appendLog("Starting...\n", file);
        return file;
    }

    appendLog(message, file) {
        console.log("Appending msg: " + message + " to file: " + file);
        fs.appendFileSync(file, message);
    }
} 