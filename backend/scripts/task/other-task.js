const jetpack = require('fs-jetpack')
const stringSimilarity = require('string-similarity')
const async = require('async')
const scan = require('net-scan')
const portNumbers = require('port-numbers')
const puppeteer = require('puppeteer')
const WebDriver = require('../utils/web-driver')
const taskParent = require('./task-parent.js')
const logger = require('../logger')

const TASK_GLOBAL_NAME = 'Other task'
const PATH_GIT_CONFIG = '/task_settings/configuration/git_config'
const DEFAULT_GIT_PPST = 75

module.exports = class OtherTask extends taskParent {

	constructor(jsonconfig, crawlerOut) {
		super(jsonconfig, TASK_GLOBAL_NAME)
		this.serverHome = jsonconfig.serverHome
		this.crawlerOut = crawlerOut
	}

	start() {
		let state = false
		async.waterfall([
			(callback) => {
				if (this.jsonconfig.taskdata.othertab.data.testJavascriptImport) {
					this._doJavascriptImport(callback)
				} else {
					callback()
				}
			}, (callback) => {
				if (this.jsonconfig.taskdata.othertab.data.testHttpHttps) {
					this._doHttpHttps(callback)
				} else {
					callback()
				}
			}, (callback) => {
				if (this.jsonconfig.taskdata.othertab.data.testGitConfig) {
					this._doGitConfig(callback)
				} else {
					callback()
				}
			}, (callback) => {
				if (this.jsonconfig.taskdata.othertab.data.testCrossOriginReq) {
					this._doCrossOriginReq(callback)
				} else {
					callback()
				}
			}, (callback) => {
				if (this.jsonconfig.taskdata.othertab.data.testPortScan) {
					this._doPortScan({
						from: this.jsonconfig.taskdata.othertab.data.testPortScanDataFrom,
						to: this.jsonconfig.taskdata.othertab.data.testPortScanDataTo,
					}, this.serverHome, callback)
				} else {
					callback()
				}
			}], (err) => {
				if (err) {
					console.error(err)
					throw err
				}
				state = true
			})

		require('deasync').loopWhile(() => { return !state })
		return this.taskRes
	}

	_doJavascriptImport(cb) {
		let logData = {
			text: 'InlineJS',
			data: [],
		}
		logger.log('debug', 'Starting javascript import test')
		let state = false;
		(async () => {
			let webDriver = new WebDriver()
			console.log(this.crawlerOut.length)
			for (let i = 0; i < this.crawlerOut.length; i++) {
				let url = this.crawlerOut[i][0]
				if (await webDriver.isHtml(url)) {
					//skip if url is not html content
					await webDriver.goToSafe(url)
					let hasInjs = await webDriver.hasInlineScript()
					console.log(hasInjs + ' | ' + url)
					if (hasInjs) {
						logData.data.push({
							text: ['InlineJS on: ', url].join(''),
							vulnerability: 0,
						})
						hasInjs = true
					}
				}
			}
			await webDriver.closeDriver()
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })

		if (logData.data.length === 0) {
			//not found
			logData.data.push({
				text: 'InlineJS was not found',
				vulnerability: 1,
			})
		}
		this.taskRes.data.push(logData)
		cb()
	}

	_doHttpHttps(cb) {
		let logData = {
			text: 'HTTPS checker',
			data: [],
		}

		logger.log('debug', 'Starting http/https test')
		console.log(['Checking ', this.serverHome, ' server protocol'].join(''))
		let url = this.serverHome;
		(async () => {
			const browser = await puppeteer.launch()
			const page = await browser.newPage()
			await page.goto(url)

			let protocol = await page.evaluate(() => {
				return location.protocol
			})
			protocol = protocol.replace(':', '')
			console.log(['Server ', this.serverHome, ' using ', protocol, ' protocol'].join(''))

			if (protocol.toLowerCase() !== 'https') {
				logData.data.push({
					text: 'Server not using https',
					vulnerability: 0,
				})
			} else {
				logData.data.push({
					text: 'Server using https',
					vulnerability: 1,
				})
			}
			this.taskRes.data.push(logData)
			browser.close()
			cb()
		})()
	}

	_doCrossOriginReq(cb) {
		let logData = {
			text: 'Cross-origin resource sharing',
			data: [],
		}

		let webDriver = new WebDriver()
		let res
		let state = false;

		(async () => {
			console.log(['Testing cross on', this.serverHome].join(' '))
			//get some error page
			await webDriver.goTo('https://google.com')

			res = await webDriver.hasCrossOriginAllowed(this.serverHome)
			console.log(res)
			await webDriver.closeDriver()
			state = true
		})()
		require('deasync').loopWhile(() => { return !state })

		if (!res) {
			logData.data.push({
				text: 'Server not allows cross origin requests',
				vulnerability: 1, //no
			})
		} else {
			logData.data.push({
				text: 'Server allows cross origin requests',
				vulnerability: 2, //def
			})
		}
		this.taskRes.data.push(logData)
		cb()
	}

	_doGitConfig(cb) {
		let logData = {
			text: 'Git config checker',
			data: [],
		}

		logger.log('debug', 'Starting gitconfig test')

		let homeUrl = this.serverHome
		let data = jetpack.read([process.cwd(), PATH_GIT_CONFIG].join('')).match(/[^\r\n]+/g)
		let webDriver = new WebDriver()

		let baseUrl = [homeUrl, '.a/cxydaseqw', Math.random().toString(36).substring(7)].join('')
		let resV = []
		let state = false;

		(async () => {
			//get some error page
			await webDriver.goTo(baseUrl)
			let firstDoc = await webDriver.getDocumentText()

			for (let i = 0; i < data.length; i++) {
				let url = [homeUrl, data[i]].join('')
				let wdRes = await webDriver.goToSafe(url)
				console.log(['GitChecker: checking ', url].join(''))
				let res = -1
				//if was error, or url is file, or 404, 403....
				if (!wdRes.wasHtml || wdRes.statusCode !== 200) {
					//if url was not html ...
					res = 100
				} else {
					let actDoc = await webDriver.getDocumentText()
					res = stringSimilarity.compareTwoStrings(firstDoc, actDoc) * 100
				}
				console.log(res)
				resV.push({
					url: url,
					ppst: res,
				})
			}
			await webDriver.closeDriver()
			state = true
		})()
		require('deasync').loopWhile(() => { return !state })


		//firt check

		let ppst = this.jsonconfig.taskdata.othertab.data.testGitConfigPpst
		if (!ppst) { ppst = DEFAULT_GIT_PPST }
		ppst = parseInt(ppst)
		Object.keys(resV).forEach((key) => {
			if (resV[key].ppst < ppst) {
				console.log(['GitChecker: found git config file on ', resV[key].url].join(''))

				logData.data.push({
					text: ['Find part of git config on ', resV[key].url].join(''),
					vulnerability: 0,
				})
			}
		})
		if (logData.data.length === 0) {
			//not found
			logData.data.push({
				text: 'Git config was not found',
				vulnerability: 1,
			})
		}
		this.taskRes.data.push(logData)
		cb()
	}

	_doPortScan(field, serverHome, cb) {
		let logData = {
			text: 'PortScan',
			data: [],
		}

		let tmpHost = serverHome.replace(/(^\w+:|^)\/\//, '').replace('www.', '').replace('/', '')
		logger.log('debug', 'Starting portscan test')

		console.log(['Starting port scan on range: ', field.from, ' - ', field.to, ' on ', tmpHost].join(''))

		if (!Number.isInteger(field.from) || !Number.isInteger(field.to)) {
			console.log(['Invalids ports from: ', field.from, ', to: ', field.to].join(''))
			cb()
		} else {
			scan.port({
				host: tmpHost,
				start: field.from,
				end: field.to,
				timeout: 1000,
				queue: 1000,
			})
				.on('open', (port) => {
					let portString = portNumbers.getService(port)
					if (portString === null) {
						console.log(['Open port ', port].join(''))

						logData.data.push({
							text: ['Open port ', port].join(''),
							vulnerability: 2,
						})
					}
					else {
						console.log(['Open port ', portString.name, ' on ', port, ' - (', portString.description, ')'].join(''))

						logData.data.push({
							text: ['Open port ', portString.name, ' on ', port, ' - (', portString.description, ')'].join(''),
							vulnerability: 2,
						})
					}
				})
				.on('end', () => {
					this.taskRes.data.push(logData)
					cb()
				})
		}
	}
}