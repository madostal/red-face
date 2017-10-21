const WebDriver = require('./WebDriver')

module.exports = class Crawler {

	constructor(home) {
		this.home = home
		this.webDriver = new WebDriver()
		this.urls = new Array()
		// visited - url - writable elemets
		this.urls.push([false, home, false])
	}

	_wasCrawled(input) {
		for (let i = 0; i < this.urls.length; i++) {
			if (this.urls[i][1] === input) {
				return true
			}
		}
		return false
	}

	_getUnvisited() {
		for (let i = 0; i < this.urls.length; i++) {
			if (!this.urls[i][0]) {
				this.urls[i][0] = true
				return this.urls[i]
			}
		}
		return null
	}

	_setHasWritable(url) {
		for (let i = 0; i < this.urls.length; i++) {
			if (this.urls[i][1] === url) {
				this.urls[i][2] = true
			}
		}
	}

	crawle() {
		let url = this._getUnvisited()
		while (url !== null) {

			this.webDriver.goTo(url[1])

			//check if page has some input, text area etc..
			if (this.webDriver.hasWritableElements()) {
				this._setHasWritable(url[1])
			}

			let lastLinkst = this.webDriver.extractAllLinks()

			for (let i = 0; i < lastLinkst.length; i++) {
				let value = lastLinkst[i]
				if (!this._wasCrawled(value) && (value.startsWith(this.home) && value !== url)) {
					this.urls.push([false, value, false])
				}
			}

			url = this._getUnvisited()
		}

		this._shutDown()
	}

	_shutDown() {
		this.webDriver.closeDriver()
	}

	getUrls() {
		let output = [];
		(this.urls).forEach((item) => {
			//remove first flag - was url visited
			output.push([item[1], item[2]])
		})
		return output
	}
}