const jetpack = require('fs-jetpack')
const request = require('request')
const url = require('url')
const queryString = require('query-string')
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

const FORM_ACTION_HIJACING_KEY = 'RedFaceFormActionHijacking'

module.exports = class OtherTask extends taskParent {

	constructor(jsonconfig, crawlerOut) {
		super(jsonconfig, TASK_GLOBAL_NAME, true)
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
				if (this.jsonconfig.taskdata.othertab.data.testFormActionHijacking) {
					this._doTestFormActionHijacking(callback)
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
					return
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

			for (let i = 0; i < this.crawlerOut.length; i++) {
				let url = this.crawlerOut[i][0]
				if (await this.webDriver.isHtml(url)) {
					//skip if url is not html content
					await this.webDriver.goToSafe(url)
					let hasInjs = await this.webDriver.hasInlineScript()
					console.log(hasInjs + ' | ' + this._parseUrl(url))
					if (hasInjs) {
						logData.data.push({
							text: ['InlineJS on: ', url].join(''),
							vulnerability: 0,
						})
						hasInjs = true
					}
				}
			}
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

	_doTestFormActionHijacking(cb) {
		let logData = {
			text: 'Form action hijacking',
			data: [],
		}

		logger.log('debug', 'Starting form action hijacking')

		let lookFor = '//form'
		lookFor = lookFor.replace(/\W/g, '')

		let toTest = []

		this.crawlerOut.forEach(e => {
			if (e[1].hasOwnProperty(lookFor)
				&& e[1][lookFor]) {
				let tmpUrl = e[0]

				let parsedUrl = url.parse(tmpUrl)
				//has url query?
				if (parsedUrl.query) {
					let parsedQuery = queryString.parse(parsedUrl.query)

					Object.keys(parsedQuery).forEach((key, ) => {

						let tmp = parsedUrl.query.replace(
							[key, '=', parsedQuery[key]].join(''),
							[key, '=', FORM_ACTION_HIJACING_KEY].join(''),
						)
						toTest.push(
							[
								tmpUrl,
								tmpUrl.replace(parsedUrl.query,
									tmp
								)
							]
						)
					})
				}
			}
		});

		(async () => {

			for (let i = 0; i < toTest.length; i++) {
				console.log(['Testing ', this._parseUrl(toTest[i][1])].join(''))
				await this.webDriver.goTo(toTest[i][1])
				require('deasync').sleep(1000)
				let r = await this.webDriver.getActionFromForm()
				for (let i = 0; i < r.length; i++) {
					if (r[i] === FORM_ACTION_HIJACING_KEY) {
						logData.data.push({
							text: ['Possible Form Action Hijacking on: ', this._parseUrl(toTest[i][1]), ' original url: ' + this._parseUrl(toTest[i][0])].join(''),
							vulnerability: 0,
						})
						break
					}
				}
			}

			if (logData.data.length === 0) {
				//not found
				logData.data.push({
					text: 'Form Action Hijacking was not found',
					vulnerability: 1,
				})
			}
			this.taskRes.data.push(logData)
			cb()
		})()
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
			console.log(['Server ', this._parseUrl(this.serverHome), ' using ', protocol, ' protocol'].join(''))

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

		let state = false
		let res = false

		request(this.serverHome, function (error, response, body) {
			if (response.headers['access-control-allow-origin']
				&& response.headers['access-control-allow-origin'] === '*') {
				res = true
			}
			state = true
		})

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

		let baseUrl = [homeUrl, '.a/cxydaseqw', Math.random().toString(36).substring(7)].join('')
		let resV = []
		let state = false;

		(async () => {
			//get some error page
			await this.webDriver.goTo(baseUrl)
			let firstDoc = await this.webDriver.getDocumentText()

			for (let i = 0; i < data.length; i++) {
				let url = [homeUrl, data[i]].join('')
				let wdRes = await this.webDriver.goToSafe(url)
				console.log(['GitChecker: checking ', this._parseUrl(url)].join(''))
				let res = -1
				//if was error, or url is file, or 404, 403....
				if (!wdRes.wasHtml || wdRes.statusCode !== 200) {
					//if url was not html ...
					res = 100
				} else {
					let actDoc = await this.webDriver.getDocumentText()
					res = stringSimilarity.compareTwoStrings(firstDoc, actDoc) * 100
				}
				console.log([this._parseUrl(url), res, "%"].join(' '))
				resV.push({
					url: url,
					ppst: res,
				})
			}
			state = true
		})()
		require('deasync').loopWhile(() => { return !state })


		//firt check

		let ppst = this.jsonconfig.taskdata.othertab.data.testGitConfigPpst
		if (!ppst) { ppst = DEFAULT_GIT_PPST }
		ppst = parseInt(ppst)
		Object.keys(resV).forEach((key) => {
			if (resV[key].ppst < ppst) {
				console.log(['GitChecker: found git config file on ', this._parseUrl(resV[key].url)].join(''))

				logData.data.push({
					text: ['Find part of git config on ', this._parseUrl(resV[key].url)].join(''),
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
		} else {
			logData.data.push({
				text: 'Git config was found',
				vulnerability: 2,
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

		field.from = parseInt(field.from)
		field.to = parseInt(field.to)

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