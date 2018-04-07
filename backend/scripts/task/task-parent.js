const WebDriver = require('../utils/web-driver')

module.exports = class ParentTask {

	constructor(jsonconfig, name, needWd) {
		this.jsonconfig = jsonconfig
		this.taskRes = {
			header: name,
			data: [],
		}
		this.needWd = needWd
		this.wdIsAlive = needWd
		if (needWd) {
			this.webDriver = new WebDriver()
		}
	}

	_parseUrl(url) {
		return url.split(' ').join('%20')
	}

	killDriver() {
		if (!this.needWd) return
		if (!this.wdIsAlive) return
		this.wdIsAlive = false
		let state = false;
		console.log('Closing webdriver')
		require('deasync').sleep(1000);
		(async () => {
			this.webDriver.closeDriver()
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })
	}
}
