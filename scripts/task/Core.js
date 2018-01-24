const async = require('async')
const taskHome = require('./TaskHome')
const database = require('../utils/Database')
const library = require('../utils/Library')
const BruteForceTask = require('./BruteForceTask')
const OtherTask = require('./OtherTask')
const logger = require('../Logger')
const jetpack = require('fs-jetpack')

class Core {

	constructor(taskId) {
		logger.log('debug', ['Starting task id: ', taskId].join(''))

		this.taskId = taskId
		this.taskData = null
		this.taskConfig = null
	}

	start() {
		let self = this
		database.connection.query('SELECT * FROM task WHERE id = ?', [this.taskId], (err, fields) => {
			if (err) {
				throw err
			}
			self.taskData = fields[0]
			console.log(self.taskData)
			self._loadInfo()
		})
	}

	/**
	 * Load info from database and create subtasks for job
	 */
	_loadInfo() {
		this.taskConfig = JSON.parse(jetpack.read(this.taskData.configPath))
		console.log('LOADING INFO')
		console.log(this.taskConfig)
		library.urlExists(this.taskData.serverHome, (err, exists) => {
			if (exists) {
				console.log(['\'', this.taskData.serverHome, '\' exist, starting testing...'].join(''))
				this._startJob()
			}
			else {
				console.log(['\'', this.taskData.serverHome, '\' doesn\'t exist, ending testing...'].join(''))
			}
		})
	}

	/**
	 * Take each sub task in loop and synchrony do a task job
	 */
	_startJob() {
		this._setStream(this.taskData.logPath)

		if (this.taskConfig.taskdata.bruteforcetab.data !== null && this.taskConfig.taskdata.bruteforcetab.data.enable) {
			new BruteForceTask(this.taskConfig, this.taskData.configPath).start()
		}
		if (this.taskConfig.taskdata.othertab.data !== null && this.taskConfig.taskdata.othertab.data.enable) {
			new OtherTask(this.taskConfig).start()
		}
		if (this.taskConfig.taskdata.xsstab.data !== null && this.taskConfig.taskdata.xsstab.data.enable) {
			console.log('xsstab TAB ENABLE')
		}
		// if (this.taskConfig.taskdata.sqltab.data !== null
		// 	&& this.taskConfig.taskdata.sqltab.data.enable) {
		// 	console.log('sqltab TAB ENABLE')
		// }
		this._shutDown()
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
		database.connection.query('UPDATE subTask SET state = ?, endTime = ? WHERE task_id = ? ', params, (err) => {
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