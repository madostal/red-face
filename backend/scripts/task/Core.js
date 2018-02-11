
const jetpack = require('fs-jetpack')
const taskHome = require('./task-home')
const database = require('../utils/database')
const library = require('../utils/library')
const CrawlerTask = require('./crawler-task')
const BruteForceTask = require('./brute-force-task')
const OtherTask = require('./other-task')
const XSSTask = require('./xss-task')
const SQLTask = require('./sql-inj-task')
const logger = require('../logger')

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
		let results = []

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
				}
			}
			results.push(new BruteForceTask(this.taskConfig, this.taskData.configPath)
				.start())
		}
		if (this.taskConfig.taskdata.othertab.data !== null && this.taskConfig.taskdata.othertab.data.enable) {
			results.push(
				new OtherTask(this.taskConfig, crawlerOut)
					.start())
		}
		if (this.taskConfig.taskdata.xsstab.data !== null && this.taskConfig.taskdata.xsstab.data.enable) {
			results.push(
				new XSSTask(this.taskConfig, null, crawlerOut)
					.start())
		}
		if (this.taskConfig.taskdata.sqltab.data !== null && this.taskConfig.taskdata.sqltab.data.enable) {
			results.push(
				new SQLTask(this.taskConfig, null, crawlerOut)
					.start())
		}
		this._printTestRes(results)
		this._shutDown()
	}

	/**
	 * Print results of testing into console (stream over process)
	 *
	 * @param {array} res
	 */
	_printTestRes(res) {
		console.log('TEST RESULTS')
		console.log('')
		res.forEach(e => {
			console.log(e.header)
			e.data.forEach(i => {
				console.log(i)
			})
		})
	}

	/**
	 * Shut downl taks process with successfully exit code
	 */
	_shutDown() {
		logger.log('debug', ['Shut down task id: ', this.taskId].join(''))
		process.exit(0)
	}

	_XPathToCrawleString(xpath) {
		return xpath.replace(/\W/g, '')
	}
}

new Core(process.argv.slice(2)[0])
	.start()