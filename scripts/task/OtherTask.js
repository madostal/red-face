const jetpack = require('fs-jetpack')
const async = require('async')
const scan = require('net-scan')
const portNumbers = require('port-numbers')
const puppeteer = require('puppeteer')

const taskParent = require('./TaskParent.js')
const database = require('../utils/Database.js')
const logger = require('../Logger')
const request = require('sync-request')
const sleep = require('system-sleep')


const PATH_GIT_CONFIG = '/task_settings/configuration/git_config'

module.exports = class OtherTask extends taskParent {

	constructor(jsonconfig) {
		super(jsonconfig)
		this.serverHome = jsonconfig.serverHome
	}

	start() {
		console.log("AAAAAAAAAAAAAA")
		console.log(this.jsonconfig)
		console.log(this.jsonconfig.taskdata.othertab.data.testJavascriptImport)
		let state = false
		async.parallel([
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
				if (this.jsonconfig.taskdata.othertab.data.testPortScan) {
					this._doPortScan([this.jsonconfig.taskdata.othertab.data.testPortScanDataFrom,
						this.jsonconfig.taskdata.othertab.data.testPortScanDataTo], this.serverHome, callback)
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

		while (!state) {
			sleep(1000)
		}
		console.log("ALL DONE")
	}

	_doJavascriptImport(cb) {
		logger.log('debug', 'Starting javascript import test')
		cb()
	}

	_doHttpHttps(cb) {
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
			cb()
		})()
	}

	_doGitConfig(cb) {
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
			cb(null)
		})
	}

	_doPortScan(field, serverHome, cb) {
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
				cb(null)
			})
	}
}