
const jetpack = require('fs-jetpack')
const taskHome = require('./task-home')
const database = require('../utils/database')
const library = require('../utils/library')
const CrawlerTask = require('./crawler-task')
const BruteForceTask = require('./brute-force-task')
const TraversalPathAttack = require('./traversal-path-attack-task')
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
				this._shutDown()
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
			let bruteforceAutoRes = false
			if (this.taskConfig.taskdata.bruteforcetab.data.locationAuto) {
				//find login page in crawler res
				let formPath = this._XPathToCrawleString(this.taskConfig.taskdata.bruteforcetab.data.loginFormXPathExpr)
				let loginPath = this._XPathToCrawleString(this.taskConfig.taskdata.bruteforcetab.data.loginNameXPathExpr)
				let pswPath = this._XPathToCrawleString(this.taskConfig.taskdata.bruteforcetab.data.loginPswXPathExpr)

				for (let i = 0; i < crawlerOut.length; i++) {
					//if crawler res has login form, inputs.. we found
					if (crawlerOut[i][1].hasOwnProperty(formPath)
						&& crawlerOut[i][1].hasOwnProperty(loginPath)
						&& crawlerOut[i][1].hasOwnProperty(pswPath)
						&& crawlerOut[i][1][formPath] === true) {
						bruteforceAutoRes = (crawlerOut[i][0])
						break
					}
				}
				if (bruteforceAutoRes) {
					this.taskConfig.taskdata.bruteforcetab.data.location = bruteforceAutoRes.replace(this.taskConfig.serverHome, '')
				}
			}
			results.push(new BruteForceTask(
				this.taskConfig,
				this.taskData.configPath,
				this.taskConfig.taskdata.bruteforcetab.data.locationAuto,
				bruteforceAutoRes
			)
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
		if (this.taskConfig.taskdata.ptatab.data !== null && this.taskConfig.taskdata.ptatab.data.enable) {
			results.push(
				new TraversalPathAttack(this.taskConfig, crawlerOut)
					.start())
		}
		this._shutDown(results)
	}

	/**
	 * Print results of testing into console (stream over process)
	 *
	 * @param {array} res
	 */
	_printTestRes(res) {
		console.log('>TEST RESULTS:')
		if (!res) return
		res.forEach(e => {
			if (e && e.data) {
				e.data.forEach(i => {
					if (i && i.data) {
						i.data.forEach(j => {
							console.log(j.text + " : vulnerability level: " + j.vulnerability)
						})
					}
				})
				console.log('\n\n')
			}
		})
	}

	/**
	 * Shut downl taks process with successfully exit code
	 */
	_shutDown(results) {
		logger.log('debug', ['Shut down task id: ', this.taskId].join(''))
		this._printTestRes(results)
		process.exit(0)
	}

	_XPathToCrawleString(xpath) {
		return xpath.replace(/\W/g, '')
	}
}

new Core(process.argv.slice(2)[0])
	.start()