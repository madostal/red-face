
const taskHome = require('./TaskHome')
const database = require('../utils/Database')
const library = require('../utils/Library')
const CrawlerTask = require('./CrawlerTask')
const BruteForceTask = require('./BruteForceTask')
const OtherTask = require('./OtherTask')
const XSSTask = require('./XSSTask')
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
		let crawlerOut
		if (this.taskConfig.crawlerisneed) {
			crawlerOut = new CrawlerTask(this.taskConfig.serverHome, this.taskConfig.crawlerdeep,
				this.taskConfig.taskdata.bruteforcetab.data.loginFormXPathExpr,
				this.taskConfig.taskdata.bruteforcetab.data.loginNameXPathExpr,
				this.taskConfig.taskdata.bruteforcetab.data.loginPswXPathExpr
			).getRes()
		}

		if (this.taskConfig.taskdata.bruteforcetab.data !== null && this.taskConfig.taskdata.bruteforcetab.data.enable) {
			if (this.taskConfig.taskdata.bruteforcetab.data.locationAuto) {
				//find login page in crawler res
				let formPath = this._XPathToCrawleString(this.taskConfig.taskdata.bruteforcetab.data.loginFormXPathExpr)
				let loginPath = this._XPathToCrawleString(this.taskConfig.taskdata.bruteforcetab.data.loginNameXPathExpr)
				let pswPath = this._XPathToCrawleString(this.taskConfig.taskdata.bruteforcetab.data.loginPswXPathExpr)
				let res
				for (let i = 0; i < crawlerOut.length; i++) {
					//if crawler res has login form, inputs.. we found
					if (crawlerOut[i][1].hasOwnProperty(formPath)
						&& crawlerOut[i][1].hasOwnProperty(loginPath)
						&& crawlerOut[i][1].hasOwnProperty(pswPath)
						&& crawlerOut[i][1][formPath] === true) {
						res = (crawlerOut[i][0])
						break
					}
				}
				if (!res) {
					console.log('BRUTEFORCE TASK: login form was not found')
				} else {
					this.taskConfig.taskdata.bruteforcetab.data.location = res.replace(this.taskConfig.serverHome, '')
					new BruteForceTask(this.taskConfig, this.taskData.configPath).start()
				}
			} else {
				new BruteForceTask(this.taskConfig, this.taskData.configPath).start()
			}

		}
		if (this.taskConfig.taskdata.othertab.data !== null && this.taskConfig.taskdata.othertab.data.enable) {
			new OtherTask(this.taskConfig).start()
		}
		if (this.taskConfig.taskdata.xsstab.data !== null && this.taskConfig.taskdata.xsstab.data.enable) {
			new XSSTask(this.taskConfig, null, crawlerOut).start()
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

	_XPathToCrawleString(xpath) {
		return xpath.replace(/\W/g, '')
	}
}

new Core(process.argv.slice(2)[0])
	.start()