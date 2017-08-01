'use strict';

module.exports = class Pool {

    constructor(io) {
        this.allowProcess = 2;
        this.activeProcess = 0;
        this.poolQueue = [];

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
        this.activeProcess++;
        this.io.emit('taskstart', "TASK " + id + " STARTED :-)");

        const { spawn } = require('child_process');

        const process = spawn('node', ['utils/tester.js', id]);

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
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
} 