module.exports = class ParentTask {

    constructor(taskId) {
        this.taskId = taskId;
        this.logFile = "";
    }

    setLogFile(logFile) {
        this.logFile = logFile;
    }

    getLogFile() {
        return this.logFile;
    }
}