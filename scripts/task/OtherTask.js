const jetpack = require('fs-jetpack')
const async = require('async')
const scan = require('net-scan')
const portNumbers = require('port-numbers')
const puppeteer = require('puppeteer')

const taskParent = require('./TaskParent.js')
const database = require('../utils/Database.js')
const logger = require('../Logger')
const request = require('sync-request')

const PATH_GIT_CONFIG = '/task_settings/configuration/git_config'

module.exports = class OtherTask extends taskParent {

	constructor(taskId, serverHome) {
		super(taskId)
		this.serverHome = serverHome
	}

	start(coreCallback) {
		let self = this

		database.connection.query('SELECT * FROM otherTask WHERE subTask_id = ? LIMIT 1', [this.taskId], (err, field) => {
			if (err) {
				console.error(err)
				throw err
			}

			field = field[0]
			console.log('OTheR TASK:')
			console.log(field)
			async.waterfall([
				function (callback) {
					if (field.testHttpHttps === 1) {
						self._doHttpHttps(callback)
					}
					else {
						callback(null)
					}
				},
				function (callback) {
					if (field.testJavascriptImport === 1) {
						self._doJavascriptImport(callback)
					}
					else {
						callback(null)
					}
				},
				function (callback) {
					if (field.testGitConfig === 1) {
						self._doGitConfig(callback)
					}
					else {
						callback(null)
					}
				},
				function (callback) {
					if (field.testPortScan === 1) {
						database.connection.query('SELECT * FROM portScan WHERE otherTask_id = ? LIMIT 1', [field.id], (err, field) => {
							if (err) {
								console.error(err)
								throw err
							}
							console.log(field)
							self._doPortScan(field[0], self.serverHome, callback)
						})
					}
					else {
						callback(null)
					}
				},
			], (err) => {
				console.log('Other task done...')
				coreCallback(null)
			})
		})
	}

	_doHttpHttps(callback) {
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

			console.log(['Server ', this.serverHome, ' using ', protocol.replace(':', ''), ' protocol'].join(''))
			browser.close()
			callback(null)
		})()
	}

	_doJavascriptImport(coreCallback) {
		logger.log('debug', 'Starting javascript import test')
		coreCallback(null)
	}

	_doGitConfig(coreCallback) {
		logger.log('debug', 'Starting gitconfig test')

		let homeUrl = this.serverHome
		async.waterfall([
			function (callback) {
				let data = jetpack.read([process.cwd(), PATH_GIT_CONFIG].join('')).match(/[^\r\n]+/g)

				let res = []

				data.forEach((value) => {
					let url = [homeUrl, value].join('')
					let res = request('GET', url)
					console.log([url, ': ', res.statusCode].join(''))
				})
				callback(null)
			},
		], (err) => {
			coreCallback(null)
		})
	}

	_doPortScan(field, serverHome, callback) {
		let tmpHost = serverHome.replace(/(^\w+:|^)\/\//, '').replace('www.', '').replace('/', '')
		logger.log('debug', 'Starting portscan test')

		console.log(['Starting port scan on range: ', field.from, ' - ', field.to, ' on ', tmpHost].join(''))

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
					console.log(port)
				}
				else {
					console.log([portString.name, ' on ', port, ' - (', portString.description, ')'].join(''))
				}
			})
			.on('end', () => {
				callback(null)
			})
	}
}