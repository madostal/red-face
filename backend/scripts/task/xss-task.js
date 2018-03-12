const url = require('url')
const queryString = require('query-string')

const taskParent = require('./task-parent.js')
const WebDriver = require('../utils/web-driver')

const TASK_GLOBAL_NAME = 'XSS task'

module.exports = class XSSTask extends taskParent {

	constructor(jsonconfig, url, crawlerRes) {
		super(jsonconfig, TASK_GLOBAL_NAME, true)
		this.url = url
		this.crawlerRes = crawlerRes
	}

	start() {
		console.log('Starting XSS attack')

		let wasStarted = false
		if (this.jsonconfig.taskdata.xsstab.data.userSettings) {
			if (this.jsonconfig.taskdata.xsstab.data.testForms) {
				this._testInputs()
				wasStarted = true
			}

			if (this.jsonconfig.taskdata.xsstab.data.testParams) {
				this._testParams()
				wasStarted = true
			}
		}

		if (!wasStarted) {
			let logData = {
				text: 'XSS task inputs',
				data: [],
			}
			console.log('Input settings is empty')
			logData.data.push({
				text: 'XSS wasn\'t started',
				vulnerability: 3,
			})
			this.taskRes.data.push(logData)
		}

		console.log('XSS task finished')
		return this.taskRes
	}

	_testInputs() {
		let logData = {
			text: 'XSS task inputs',
			data: [],
		}

		let xssTabData = this.jsonconfig.taskdata.xsstab.data
		console.log('Starting XSS task')
		let state = false;

		(async () => {
			if (this.crawlerRes) {
				for (let i = 0; i < this.crawlerRes.length; i++) {
					//crawler res data
					let data = this.crawlerRes[i][1]
					let hasWritable = false
					//test if input from crawler has writable elements
					Object.keys(data).forEach((key) => {
						if (key === 'neibor') {
							//skip neibor object,
						} else if (data[key] === true) {
							hasWritable = true
						}
					})
					if (!hasWritable) {
						//0 writable elements
						continue
					}

					console.log(['Scanning', this._parseUrl(this.crawlerRes[i][0])].join(' '))

					let url = this.crawlerRes[i][0]
					await this.webDriver.goTo(url)

					// TODO VYRESIT PREPINANI IFRAMU JAKO V LOCAL WEB CRAWLERU
					let elements = await this.webDriver.getElementsFromArray(['//input[@type=\'text\']'])
					console.log(['Number of elements for scan is', elements.length].join(' '))

					//contains reported pages+xpath of element
					let reportedPages = new Set()
					//loop over all inputs query
					for (let q = 0; q < xssTabData.userSettings.length; q++) {
						let actualQ = xssTabData.userSettings[q]

						for (let i = 0; i < elements.length; i++) {
							let lastXpath = await this.webDriver.findXPathOfElement(elements[i])
							await this.webDriver.sendKeysToElement(elements[i], actualQ)

							require('deasync').sleep(2000)
							let wasNowFound = false

							while (await this.webDriver.testAlertPresentAndClose()) {
								if (!reportedPages.has(url + lastXpath)) {
									console.log(['Possible xss on', this._parseUrl(url)].join(' '))
									console.log(lastXpath)

									logData.data.push({
										text: ['Possible XSS on: ', this._parseUrl(url), ' - (', lastXpath, ')'].join(''),
										vulnerability: 0,
									})

									reportedPages.add(url + lastXpath)
								}
								wasNowFound = true
							}

							if (!wasNowFound) {
								//try to send form if xxs was not found
								await this.webDriver.sendFormIfExist(elements[i])
								require('deasync').sleep(1000)

								while (await this.webDriver.testAlertPresentAndClose()) {
									if (!reportedPages.has(url + lastXpath)) {
										console.log(['Possible xss on', this._parseUrl(url)].join(' '))
										console.log(lastXpath)

										logData.data.push({
											text: ['Possible XSS on: ', url, '(', lastXpath, ')'].join(''),
											vulnerability: 0,
										})

										reportedPages.add(url + lastXpath)
									}
									wasNowFound = true
								}
							}

							//restart page
							await this.webDriver.goTo(url)
							elements = await this.webDriver.getElementsFromArray(['//input[@type=\'text\']'])

						}
					}
				}
			}
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })

		if (logData.data.length === 0) {
			//not found
			logData.data.push({
				text: 'XSS on url forms was not found',
				vulnerability: 1,
			})
		}
		this.taskRes.data.push(logData)
		console.log('XSS input finished')
	}

	_testParams() {
		let logData = {
			text: 'XSS task params',
			data: [],
		}


		let xssTabData = this.jsonconfig.taskdata.xsstab.data

		let toTest = []

		//first, check crawler res and get url with params
		this.crawlerRes.forEach(e => {
			let tmpUrl = e[0]

			let parsedUrl = url.parse(tmpUrl)

			//has url query?
			if (parsedUrl.query) {
				let parsedQuery = queryString.parse(parsedUrl.query)
				Object.keys(parsedQuery).forEach((key, ) => {
					xssTabData.userSettings.forEach(xssItem => {
						let tmp = parsedUrl.query.replace(
							[key, '=', parsedQuery[key]].join(''),
							[key, '=', xssItem].join(''),
						)
						toTest.push(
							tmpUrl.replace(parsedUrl.query,
								tmp
							)
						)
					})
				})
			}
		})

		let state = false;
		//list of founded url with xss
		let founded = [];
		(async () => {
			if (this.crawlerRes) {
				for (let i = 0; i < toTest.length; i++) {
					if (!founded.includes(toTest[i])) {
						if (await this._testUrl(toTest[i])) {
							logData.data.push({
								text: ['Possible XSS on url params: ', this._parseUrl(toTest[i])].join(''),
								vulnerability: 0,
							})
							founded.push(toTest[i])
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
				text: 'XSS on url params was not found',
				vulnerability: 1,
			})
		}
		this.taskRes.data.push(logData)
		console.log('XSS url params finished')
	}

	async _testUrl(url) {
		await this.webDriver.goTo(url)
		require('deasync').sleep(1000)

		//check xss if alert appears
		let wasFound = false
		while (await this.webDriver.testAlertPresentAndClose()) {
			//report once
			if (!wasFound) {
				wasFound = true
				console.log(['Possible xss on', this._parseUrl(url)].join(' '))
			}
		}
		return wasFound
	}
}