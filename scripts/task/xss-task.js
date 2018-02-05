const url = require('url')
const queryString = require('query-string')

const taskParent = require('./task-parent.js')
const WebDriver = require('../utils/web-driver')

module.exports = class XSSTask extends taskParent {

	constructor(jsonconfig, url, crawlerRes) {
		super(jsonconfig)
		this.url = url
		this.crawlerRes = crawlerRes

		this.webDriver = new WebDriver()
		console.log(this.crawlerRes.length)
	}

	start() {

		this._testInputs()
		this._testParams()

		let state = false;
		(async () => {
			await this.webDriver.closeDriver()
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })
		console.log('XSS task finished')
	}

	_testInputs() {
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
					console.log(['Scanning', this.crawlerRes[i][0]].join(' '))
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

							require('deasync').sleep(1000)
							let wasNowFound = false

							while (await this.webDriver.testAlertPresentAndClose()) {
								if (!reportedPages.has(url + lastXpath)) {
									console.log(['Possible xss on', url].join(' '))
									console.log(lastXpath)

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
										console.log(['Possible xss on', url].join(' '))
										console.log(lastXpath)

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
		console.log('XSS input finished')
	}
	_testParams() {
		console.log('CALLING TEST PARAMS')
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
		console.log(toTest)

		let state = false;

		(async () => {
			if (this.crawlerRes) {
				for (let i = 0; i < toTest.length; i++) {
					await this._testUrl(toTest[i])
				}
				state = true
			}
		})()
		require('deasync').loopWhile(() => { return !state })
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
				console.log(['Possible xss on', url].join(' '))
			}
		}
	}
}