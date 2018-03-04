const WebDriver = require('../utils/web-driver')

module.exports = class ParentTask {

	constructor(jsonconfig, name, needWd) {
		this.jsonconfig = jsonconfig
		this.taskRes = {
			header: name,
			data: [],
		}
		this.needWd = needWd
		if (needWd) {
			this.webDriver = new WebDriver()
		}
	}

	_parseUrl(url) {
		return url.split(' ').join('%20')
	}

	killDriver() {
		if (!this.needWd) return
		let state = false;
		require('deasync').sleep(1000);
		(async () => {
			this.webDriver.closeDriver()
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })
	}
}
