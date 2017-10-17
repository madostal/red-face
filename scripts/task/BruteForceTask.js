const jetpack = require('fs-jetpack')
const stringSimilarity = require('string-similarity')
const database = require('../utils/Database.js')
const taskParent = require('./TaskParent.js')
const WebDriver = require('../utils/WebDriver')
const library = require('../utils/Library')

module.exports = class BruteForceTask extends taskParent {

	constructor(taskId, serverHome) {
		super(taskId)
		this.serverHome = serverHome
	}

	start(coreCallback) {
		let self = this
		console.log(this.taskId)
		database.connection.query('SELECT * FROM bruteforceTask WHERE subTask_id = ? LIMIT 1', [this.taskId], (err, field) => {
			if (err) {
				console.error(err)
				throw err
			}
			field = field[0]

			self.serverHome = self._createUri(self.serverHome, field.urlLocation)

			let webDriver = new WebDriver()

			console.log('Starting BruteForceTask')
			console.log(['Location of login form is: ', field.loginFormXPathExpr].join(''))
			console.log(['Location of login name input is: ', field.loginNameXPathExpr].join(''))
			console.log(['Location of login password input is: ', field.loginpswXPathExpr].join(''))

			webDriver.goTo(self.serverHome, 0)
			webDriver.doLogin('red-face', '-1', field.loginFormXPathExpr, field.loginNameXPathExpr, field.loginpswXPathExpr, 0)
			let errorPage = webDriver.getDocumentText(0)

			console.log("READING FIE:" +field.testFilePath)
			let data = self._parseInputData(jetpack.read(field.testFilePath))
			console.log(data)
			data = self._createCombos(data[0][0].split(/\r?\n/), data[1][0].split(/\r?\n/))
			console.log(['There are ', data.length, ' combination for test'].join(''))

			let startTime = new Date()
			let count = 0
			for (let i = 0; i < data.length; i++) {
				count++
				console.log(['---------------------Testing', data[i][0], data[i][1]].join(' '))

				webDriver.goTo(self.serverHome, 0)
				webDriver.doLogin(data[i][0], data[i][1], field.loginFormXPathExpr, field.loginNameXPathExpr, field.loginpswXPathExpr, 0)

				let tmp = webDriver.getDocumentText(0)
				let similarity = stringSimilarity.compareTwoStrings(errorPage, tmp)

				if ((similarity * 100) < 1) {
					console.log('Probably found credentials')
					console.log([data[i][0], data[i][1]].join(' '))
					break
				}
			}

			console.log(['Avarage:', ((new Date() - startTime) / count), 'ms peer test'].join(' '))
			console.log(['It took', library.timeDiffNow(startTime), count, 'accout-password tested'].join(' '))

			webDriver.closeDriver()
			coreCallback(null)
		})
	}

	/**
	 * Create uri -> example.com + where is login form located
	 * example.com + / + login -> example.com/login
	 *
	 * @param {String} uri
	 */
	_createUri(serverHomeInput, uri) {
		console.log(serverHomeInput + " VS " + uri)
		if (serverHomeInput.endsWith('/') && uri.startsWith('/')) {
			return [serverHomeInput, uri.substr(1)].join('')
		}

		if (!serverHomeInput.endsWith('/') && !uri.startsWith('/')) {
			return [serverHomeInput, '/', uri].join('')
		}

		return [serverHomeInput, uri].join('')
	}

	/**
	 * Parse input text loaded from file to array of [login, psw]
	 *
	 * @param {String[String[]]} data
	 */
	_parseInputData(data) {
		let arr1 = []; let arr2 = []; let tmp = arr1

		for (let loop of data.split('\r\n')) {
			if (loop.length === 0) {
				tmp = arr2
				continue
			}
			tmp.push(loop)
		}

		return [arr1, arr2]
	}

	/**
	 * Create all combinations of two arrays
	 *
	 * @param {String[]} array1
	 * @param {String[]} array2
	 */
	_createCombos(array1, array2) {
		let combos = []

		for (let i = 0; i < array1.length; i++) {
			for (let j = 0; j < array2.length; j++) {
				combos.push([array1[i], array2[j]])
			}
		}
		return combos
	}
}