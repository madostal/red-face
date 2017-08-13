var taskHome = require('./TaskHome.js')
var database = require('../utils/Database.js');
var db = new database().getConnection();

var bruteForceTask = require('./BruteForceTask.js');

var args = process.argv.slice(2);
var id = args[0];

class Core {

	constructor(taskId) {
		this.taskId = taskId;
		this.todo = [];
	}

	start() {
		console.log("BEFORE SELECT")
		this._loadInfo();
	}

	_loadInfo() {
		var self = this;
		db.query('SELECT * FROM subtask WHERE task_id = ?', [this.taskId], function (err, fields) {
			if (err) throw err;
			fields.forEach(function (loop) {
				self.todo.push(loop);;
			});
			self._startJob();
		});
	}

	_startJob() {
		if (this.todo.length != 0) {

			var tasktodo = this.todo.pop();

			var self = this;
			db.query('SELECT * FROM log WHERE subTask_id = ? LIMIT 1', [tasktodo.id], function (err, fields) {
				if (err) throw err;

				self._setStream(fields[0].path);

				switch (tasktodo.type) {
					case taskHome.TaskType.bruteForce:
						new bruteForceTask(tasktodo.id);
						break;
					default:
						console.log("UNKNOWN TASK TYPE: " + tasktodo.type)
						break;
				}

				self._startJob();
			});
		} else {
			this._shutDown();
		}
	}

	_shutDown() {
		process.exit(0);
	}

	_setStream(stream) {
		process.send({ file: stream })
	}
}

new Core(id).start();