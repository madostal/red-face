const fs = require('fs')
const jetpack = require('fs-jetpack')
const stringSimilarity = require('string-similarity')

const taskParent = require('./task-parent.js')
const WebDriver = require('../utils/web-driver')

class BruteForceSubTask extends taskParent {

	async start(path, configPath, serverHome, id) {

		let webDriver = new WebDriver()
		let forceExit = false

		process.on('message', () => {
			forceExit = true
		})

		this.jsonconfig = JSON.parse(jetpack.read(configPath))
		let data = JSON.parse(jetpack.read(path))

		console.log(['Starting worker bruteforce id', id, 'with', data.length, 'combinations'].join(' '))

		await webDriver.goTo(serverHome)

		let resFirstLogin = await webDriver.doLogin('red-face', '-1', this.jsonconfig.taskdata.bruteforcetab.data.loginFormXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginNameXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginPswXPathExpr)
		if (resFirstLogin) {
			let errorPage = await webDriver.getDocumentText()

			for (let i = 0; i < data.length; i++) {
				await webDriver.goTo(serverHome)
				await webDriver.doLogin(data[i][0], data[i][1], this.jsonconfig.taskdata.bruteforcetab.data.loginFormXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginNameXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginPswXPathExpr)
				let tmp = await webDriver.getDocumentText()
				let similarity = stringSimilarity.compareTwoStrings(errorPage, tmp)
				console.log([data[i][0], ':', data[i][1], ' - ', similarity * 100, '%'].join(''))
				if ((similarity * 100) < this.jsonconfig.taskdata.bruteforcetab.data.percentageDiff) {
					console.log(['Bruteforce probably found credentials: ', data[i][0], ': ', data[i][1], ' on urn ', this._parseUrl(serverHome)].join(''))
					console.log(['!!--|0|', 'Bruteforce probably found credentials: ', data[i][0], ': ', data[i][1], ' on urn ', this._parseUrl(serverHome)].join(''))
				}
				if (forceExit) {
					break
				}
			}
		} else {
			console.log(['BruteforceWorker:', id, , '|', 'ERROR: Some xpaths wasn\'t found.Please, check your xpaths or repeat action', '- on urn', this._parseUrl(serverHome)].join(' '))
			console.log(['!!--|3|', ['Bruteforce Worker:', id, , ':', 'ERROR: Some xpaths wasn\'t found.Please, check your xpaths or repeat action', ' on urn ', this._parseUrl(serverHome)].join(' ')].join(''))
		}

		await webDriver.closeDriver()
		fs.unlink(path, (err) => {
			if (err) {
				throw err
			}
			console.log(['Closing worker id', id].join(' '))
			process.exit()
		})
	}
}

new BruteForceSubTask()
	.start(process.argv[2], process.argv[3], process.argv[4], process.argv[5])