const url = require('url')
const queryString = require('query-string')
const stringSimilarity = require('string-similarity')

const taskParent = require('./task-parent.js')
const WebDriver = require('../utils/web-driver')

module.exports = class SqlInjTask extends taskParent {

	constructor(jsonconfig, url, crawlerRes) {
		super(jsonconfig, null, true)
		this.url = url
		this.crawlerRes = crawlerRes
	}

	start() {
		console.log('SQLinj: Starting')

		if (this.jsonconfig.taskdata.sqltab.data.testParams) {
			this._testParams()
		}

		let state = false;
		(async () => {
			await this.webDriver.closeDriver()
			state = true
		})()
		require('deasync').loopWhile(() => { return !state })

		console.log('SQLinj: Finished')
		return this.taskRes
	}

	_testParams() {
		console.log('SQLinj: Starting scanning params')
		let logData = {
			text: 'SQL task params',
			data: [],
		}

		let sqlTabData = this.jsonconfig.taskdata.sqltab.data

		let toTest = []

		this.crawlerRes.forEach(e => {
			let tmpUrl = e[0]

			let parsedUrl = url.parse(tmpUrl)

			//has url query?
			if (parsedUrl.query) {
				let parsedQuery = queryString.parse(parsedUrl.query)
				Object.keys(parsedQuery).forEach((key, ) => {
					sqlTabData.userSettings.forEach(xssItem => {
						let tmp = parsedUrl.query.replace(
							[key, '=', parsedQuery[key]].join(''),
							[key, '=', xssItem].join(''),
						)
						toTest.push(
							[
								tmpUrl,
								tmpUrl.replace(parsedUrl.query,
									tmp
								)
							]
						)
						toTest.push(
							[
								tmpUrl,
								tmpUrl + xssItem
							]
						)
					})
				})
			}
		})

		let state = false
		let founded = [];
		(async () => {
			if (this.crawlerRes) {
				for (let i = 0; i < toTest.length; i++) {
					if (!founded.includes(toTest[i][0])) {
						if (await this._testUrl(toTest[i])) {
							logData.data.push({
								text: ['Possible SQL injection on url params: ', this._parseUrl(toTest[i][0]), ' - ', this._parseUrl(toTest[i][1])].join(''),
								vulnerability: 0,
							})
							founded.push(toTest[i][0])
						}
					}
				}
				state = true
			}
		})()
		require('deasync').loopWhile(() => { return !state })
		if (logData.data.length === 0) {
			//not found
			logData.data.push({
				text: 'SQL inj on url params was not found',
				vulnerability: 1,
			})
		}
		this.taskRes.data.push(logData)
		// require('deasync').loopWhile(() => { return !state })
		console.log('SQLinj: Scanning url params finished')
	}

	async _testUrl(url) {
		console.log(['Testing url ', this._parseUrl(url[0])].join(''))
		//go to default www
		await this.webDriver.goTo(url[0])
		require('deasync').sleep(1000)

		let first = await this.webDriver.getDocumentText()

		await this.webDriver.goTo(url[1])
		require('deasync').sleep(1000)
		let second = await this.webDriver.getDocumentText()

		let similarity = stringSimilarity.compareTwoStrings(first, second)
		console.log([this._parseUrl(url[0]), similarity].join(''))

		let wasFound = false
		if ((similarity * 100) < this.jsonconfig.taskdata.sqltab.data.testSqlInjPpst) {
			console.log(['Possible sql in on', this._parseUrl(url[0]), ' - ', this._parseUrl(url[1])].join(' '))
			wasFound = true
		}
		return wasFound
	}
}