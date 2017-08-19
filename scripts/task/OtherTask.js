var taskParent = require("./TaskParent.js");

module.exports = class OtherTask extends taskParent {

    /* THIS IS ONLY DEMO */
    constructor(taskId) {
        super(taskId);
        console.log("STARTING OTHERTASK");

        var loop = Math.floor(Math.random() * (60 - 15 + 1)) + 15;
        console.log("Task id: " + this.taskId + " started: " + loop + "ms");

        for (var i = 0; i < loop; i++) {
            console.log("TICK " + i);
            var ms = 1000;
            var start = new Date().getTime();
            var end = start;
            while (end < start + ms) {
                end = new Date().getTime();
            }
        }
        console.log("OTHERTASK CLOSE");
    }
}