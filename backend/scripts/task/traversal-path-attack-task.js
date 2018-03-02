const url = require('url')
const queryString = require('query-string')

const WebDriver = require('../utils/web-driver')
const taskParent = require('./task-parent.js')
const logger = require('../logger')

const TASK_GLOBAL_NAME = 'Traversal Path attack task'

module.exports = class TraversalPathAttack extends taskParent {

	constructor(jsonconfig, crawlerOut) {
		super(jsonconfig, TASK_GLOBAL_NAME)
		this.serverHome = jsonconfig.serverHome
		this.crawlerOut = crawlerOut
	}

	start() {
		let logData = {
			text: 'Traversal Path attack',
			data: [],
		}

		let tpaTabData = this.jsonconfig.taskdata.ptatab.data

		let toTest = []

		this.crawlerOut.forEach(e => {
			let tmpUrl = e[0]

			let parsedUrl = url.parse(tmpUrl)

			//has url query?
			if (parsedUrl.query) {
				let parsedQuery = queryString.parse(parsedUrl.query)
				Object.keys(parsedQuery).forEach((key, ) => {
					for (let i = 0; i < tpaTabData.userData.length; i++) {
						let tmp = parsedUrl.query.replace(
							[key, '=', parsedQuery[key]].join(''),
							[key, '=', tpaTabData.userData[i]].join(''),
						)
						toTest.push(
							[
								tmpUrl.replace(parsedUrl.query,
									tmp
								),
								tpaTabData.userData[i + 1]
							]
						)
						i++
					}
				})
			}
		})
		console.log(toTest)
		let state = false;
		(async () => {
			let webDriver = new WebDriver()
			// toTest.forEach(e=> {
			for (let i = 0; i < toTest.length; i++) {
				let url = toTest[i][0]
				let contains = toTest[i][1].toLowerCase()

				webDriver.goTo(url)
				require('deasync').sleep(1000)

				let text = (await webDriver.getDocumentText())

				text = text.toLowerCase()
				if (text.includes(contains)) {
					console.log(url)
				}
				// })
			}
			await webDriver.closeDriver()
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })

		logger.log('debug', 'Starting traversal path test')
		this.taskRes.data.push(logData)
	}
}