const async = require('async')
const taskHome = require('./TaskHome')
const database = require('../utils/Database')
const library = require('../utils/Library')
const BruteForceTask = require('./BruteForceTask')
const OtherTask = require('./OtherTask')
const logger = require('../Logger')

class Core {

	constructor(taskId) {
		logger.log('debug', ['Starting task id: ', taskId].join(''))
		//actual task id
		this.taskId = taskId
		//list of subtask todo
		this.subTasks = []
		//task data
		this.taskData = null
	}

	start() {
		let self = this
		database.connection.query('SELECT * FROM task WHERE id = ?', [this.taskId], function (err, fields) {
			if (err) {
				throw err
			}
			self.taskData = fields[0]
			console.log("TASK ADTA")
			console.log(self.taskData)
			self._loadInfo()
		})
	}

	/**
	 * Load info from database and create subtasks for job
	 */
	_loadInfo() {
		let self = this
		database.connection.query('SELECT * FROM subtask WHERE task_id = ?', [this.taskId], function (err, fields) {
			if (err) {
				throw err
			}

			fields.forEach(function (loop) {
				self.subTasks.push(loop)
			})

			logger.log('debug', ['Task id: ', self.taskId, ', subtask count: ', self.subTasks.length].join(''))

			console.log(self.taskData.serverHome)
			library.urlExists(self.taskData.serverHome, function (err, exists) {
				if (exists) {
					console.log(['\'', self.taskData.serverHome, '\' exist, starting testing...'].join(''))
					self._startJob()
				}
				else {
					console.log(['\'', self.taskData.serverHome, '\' doesn\'t exist, ending testing...'].join(''))
					//todo all task set to closed
				}
			})
		})
	}

	/**
	 * Take each sub task in loop and synchrony do a task job
	 */
	_startJob() {
		if (this.subTasks.length !== 0) {

			let tasktodo = this.subTasks.pop()

			var self = this
			database.connection.query('SELECT * FROM log WHERE subTask_id = ? LIMIT 1', [tasktodo.id], function (err, field) {
				if (err) {
					console.error(err)
					throw err
				}

				//send message to parent process and inform him about switched file for log
				self._setStream(field[0].path)

				var lastTask

				switch (tasktodo.type) {
					case taskHome.TaskType.bruteForce:
						lastTask = new BruteForceTask(tasktodo.id, self.taskData.serverHome)
						break;
					case taskHome.TaskType.other:
						lastTask = new OtherTask(tasktodo.id, self.taskData.serverHome)
						break;
					default:
						console.log('UNKNOWN TASK TYPE: ' + tasktodo.type)
						break;
				}

				async.waterfall([
					function (callback) {
						lastTask.start(callback)
					}, function (callback) {
						self._markSubTaskDone(tasktodo.id, callback)
					},
				], function (err) {
					self._startJob()
				})
			})
		}
		else {
			//task array is empty, ve are done
			this._shutDown()
		}
	}

	/**
	 * Shut downl taks process with successfully exit code
	 */
	_shutDown() {
		logger.log('debug', ['Shut down task id: ', this.taskId].join(''))
		process.exit(0)
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
	_markSubTaskDone(tasktodo, wfCallback) {
		let params = [taskHome.TaskState.done, library.getMySQLTime(), this.taskId]
		database.connection.query('UPDATE subTask SET state = ?, endTime = ? WHERE task_id = ? ', params, function (err) {
			if (err) {
				console.error(err)
				throw err
			}
			wfCallback(null)
		})
	}
}

new Core(process.argv.slice(2)[0])
	.start()