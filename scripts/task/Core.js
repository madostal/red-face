var taskHome = require('./TaskHome')
var database = require('../utils/Database');
var library = require('../utils/Library')

var bruteForceTask = require('./BruteForceTask');
var otherTask = require('./OtherTask');

var db = new database().getConnection();

class Core {

	constructor(taskId) {
		//actual task id
		this.taskId = taskId;
		//list of subtask todo
		this.subTasks = [];
	}

	start() {
		this._loadInfo();
	}

	/**
	 * Load info from database and create subtasks for job
	 */
	_loadInfo() {
		var self = this;
		db.query('SELECT * FROM subtask WHERE task_id = ?', [this.taskId], function (err, fields) {
			if (err) {
				throw err;
			}

			fields.forEach(function (loop) {
				self.subTasks.push(loop);;
			});

			self._startJob();
		});
	}

	/**
	 * Take each sub task in loop and synchrony do a task job
	 */
	_startJob() {
		if (this.subTasks.length != 0) {

			var tasktodo = this.subTasks.pop();

			var self = this;
			db.query('SELECT * FROM log WHERE subTask_id = ? LIMIT 1', [tasktodo.id], function (err, field) {
				if (err) throw err;

				//send message to parent process and inform him about switched file for log
				self._setStream(field[0].path);

				switch (tasktodo.type) {
					case taskHome.TaskType.bruteForce:
						new bruteForceTask(tasktodo.id);
						break;
					case taskHome.TaskType.other:
						new otherTask(tasktodo.id);
						break;
					default:
						console.log("UNKNOWN TASK TYPE: " + tasktodo.type);
						break;
				}
				self._markSubTaskDone(tasktodo.id);
				self._startJob();
			});
		} else {
			//task array is empty, ve are done
			this._shutDown();
		}
	}

	/**
	 * Shut downl taks process with successfully exit code
	 */
	_shutDown() {
		process.exit(0);
	}

	/**
	 * Switch file handler, where are stored logs by sendimg mesasge to parent process
	 * 
	 * @param {string} log file 
	 */
	_setStream(stream) {
		process.send({ file: stream })
	}

	/**
	 * Mark subtask as done in database
	 * 
	 */
	_markSubTaskDone() { 
		var params = [taskHome.TaskState.done, library.getMySQLTime(), this.taskId];
		db.query('UPDATE subTask SET state = ?, endTime = ? WHERE task_id = ? ', params, function (err) {
			if (err) throw err;
		});
	}
}

new Core(process.argv.slice(2)[0])
	.start();