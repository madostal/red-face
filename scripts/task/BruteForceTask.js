var taskParent = require("./TaskParent.js");

module.exports = class BruteForceTask extends taskParent {

	/* THIS IS ONLY DEMO */
	constructor(db, taskId) {
		super(db, taskId);
		//TODO REWRITE TO WATERFALL MODEL LIKE A OTHERTASK
		console.log("STARTING BRUTEFORCE");

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
		console.log("BRUTEFORCE CLOSE");
	}
};