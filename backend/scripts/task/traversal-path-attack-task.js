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

		console.log('Starting traversal path attack')

		let tpaTabData = this.jsonconfig.taskdata.ptatab.data

		let toTest = []

		if (tpaTabData.userSettings.length > 1) {
			this.crawlerOut.forEach(e => {
				let tmpUrl = e[0]

				let parsedUrl = url.parse(tmpUrl)

				//has url query?
				if (parsedUrl.query) {
					let parsedQuery = queryString.parse(parsedUrl.query)
					Object.keys(parsedQuery).forEach((key, ) => {
						for (let i = 0; i < tpaTabData.userSettings.length; i++) {
							let tmp = parsedUrl.query.replace(
								[key, '=', parsedQuery[key]].join(''),
								[key, '=', tpaTabData.userSettings[i]].join(''),
							)
							toTest.push(
								[
									tmpUrl.replace(parsedUrl.query,
										tmp
									),
									tpaTabData.userSettings[i + 1]
								]
							)
							i++
						}
					})
				}
			})

			let filtered = []

			for (let i = 0; i < toTest.length; i++) {
				let wasFound = false

				for (let j = 0; j < filtered.length; j++) {
					if (filtered[j][0] === toTest[i][0]) {
						if (!filtered[j][1].includes(toTest[i][1])) {
							filtered[j][1].push(toTest[i][1])
						}
						wasFound = true
						break
					}
				}

				if (!wasFound) {
					filtered.push(
						[
							toTest[i][0],
							[toTest[i][1]]
						]
					)
				}
			}

			toTest = filtered

			let state = false;
			(async () => {
				let webDriver = new WebDriver()
				// toTest.forEach(e=> {
				for (let i = 0; i < toTest.length; i++) {
					let url = toTest[i][0]
					let contains = toTest[i][1]

					webDriver.goTo(url)
					console.log(['Testing', url].join(' '))
					require('deasync').sleep(1000)

					let text = (await webDriver.getDocumentText())

					text = text.toLowerCase()
					for (let j = 0; j < contains.length; j++) {
						let cnt = contains[j].toLowerCase()
						if (text.includes(cnt)) {
							logData.data.push({
								text: ['Possible TPA on: ', url].join(''),
								vulnerability: 0,
							})
							console.log(['The', url, 'contain', cnt].join(' '))
						} else {
							console.log(['The', url, 'does not contain', cnt].join(' '))
						}
					}
				}
				await webDriver.closeDriver()
				state = true
			})()

			require('deasync').loopWhile(() => { return !state })
		} else {
			console.log('Input settings is empty')
			logData.data.push({
				text: 'TPA wasn\'t started',
				vulnerability: 3,
			})
		}

		if (logData.data.length === 0) {
			//not found
			logData.data.push({
				text: 'TPA on url forms was not found',
				vulnerability: 1,
			})
		}
		this.taskRes.data.push(logData)
		console.log('TPA task finished')
		return this.taskRes
	}
}