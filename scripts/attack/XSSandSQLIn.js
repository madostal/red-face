const WebDriver = require('../utils/WebDriver')
const sleep = require('system-sleep')

const XSS_ATTACK = [
//	'\';alert(String.fromCharCode(88,83,83))//\';alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>\">\'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>',
	'\'\">><marquee><img src=x onerror=confirm(1)></marquee>\"></plaintext\></|\><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>\'-->\"></script><script>alert(document.cookie)</script>\"><img/id=\"confirm&lpar;1)\"/alt=\"/\"src=\"/\"onerror=eval(id)>\'\"><img src=\"http://www.shellypalmer.com/wp-content/images/2015/07/hacked-compressor.jpg\">',
]

const tmpFolderPath = 'C:\\Users\\PanTau_acc\\Desktop'

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
				this._xssOnPage(item)
			}
			if (this.settings[1]) {
				//test sqlin
				this._sqlInOnPage(item)
			}
		})
		this.webDriver.closeDriver()
	}

	_xssOnPage(page) {

		console.log(['Starting xss attack on', page].join(' '))

		this.webDriver.goTo(page)
		sleep(1)

		let getCountOfWritableEl = function execute() {
			let selector = 'input:not([readonly])[type="text"], input[type="password"], textarea'
			return document.querySelectorAll(selector).length
		}

		let getInputPath = function execute(params) {
			let selector = 'input:not([readonly])[type="text"], input[type="password"], textarea'
			let element = document.querySelectorAll(selector)[params[0]]
			// element.setAttribute('value', params[1])
			// element.click()
			function getPathTo(elm) {
				let i
				let sib
				let allNodes = document.getElementsByTagName('*')
				for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
					if (elm.hasAttribute('id')) {
						let uniqueIdCount = 0
						for (let n = 0; n < allNodes.length; n++) {
							if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++
							if (uniqueIdCount > 1) break
						}
						if (uniqueIdCount == 1) {
							segs.unshift('id("' + elm.getAttribute('id') + '")')
							return segs.join('/')
						}
						segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]')

					}
					else if (elm.hasAttribute('class')) {
						segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]')
					}
					else {
						for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
							if (sib.localName == elm.localName) i++
						}
						segs.unshift(elm.localName.toLowerCase() + '[' + i + ']')
					}
				}
				return segs.length ? '/' + segs.join('/') : null
			}
			return getPathTo(element)
		}

		// let sendForm = function execute(params) {
		// 	let selector = 'input[type="text"], input[type="password"], textarea'
		// 	let element = document.querySelectorAll(selector)[params[0]]
		// 	if (element.form) {
		// 		element.form.submit()
		// 	}
		// }
		let getPathOfSubmitBtns = function execute(params) {
			let out = []
			let selector = 'input[type="text"], input[type="password"], textarea'
			let element = document.querySelectorAll(selector)[params[0]]

			function getPathTo(elm) {
				let i
				let sib
				let allNodes = document.getElementsByTagName('*')
				for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
					if (elm.hasAttribute('id')) {
						let uniqueIdCount = 0
						for (let n = 0; n < allNodes.length; n++) {
							if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++
							if (uniqueIdCount > 1) break
						}
						if (uniqueIdCount == 1) {
							segs.unshift('id("' + elm.getAttribute('id') + '")')
							return segs.join('/')
						}
						segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]')

					}
					else if (elm.hasAttribute('class')) {
						segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]')
					}
					else {
						for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
							if (sib.localName == elm.localName) i++
						}
						segs.unshift(elm.localName.toLowerCase() + '[' + i + ']')
					}
				}
				return segs.length ? '/' + segs.join('/') : null
			}
			if (!element.form) {
				return []
			}

			let inputs = element.form.querySelectorAll('input[type=submit]')

			inputs.forEach((loop) => {
				out.push(getPathTo(loop))
			})
			return out
		}

		let elCount = this.webDriver.executeScript(getCountOfWritableEl)

		for (let i = 0; i < elCount; i++) {
			this.webDriver.goTo(page)

			let pathsToSubmits = this.webDriver.executeScript(getPathOfSubmitBtns, [i])
			let xPath = this.webDriver.executeScript(getInputPath, [i])

			XSS_ATTACK.forEach((xssAttackLoop) => {
				pathsToSubmits.forEach((loop) => {
					this.webDriver.goTo(page)
					this._fillAndSubmit(page, xssAttackLoop, xPath, loop, this._testXSSAppears)
					sleep(1000)
				})
			})
		}
	}

	_fillAndSubmit(url, variable, pathOfInput, pathOfSubmit, testFunction) {
		console.log(['Testing', pathOfInput, pathOfSubmit].join(' '))
		this.webDriver.sendKeys(pathOfInput, variable)
		sleep(1000)
		console.log('a')
		testFunction(url, pathOfInput, this.webDriver)
		console.log('b')
		console.log(pathOfSubmit)
		this.webDriver.click(pathOfSubmit)
		sleep(1000)
		console.log('c')
		testFunction(url, pathOfInput, this.webDriver)
	}

	_testXSSAppears(url, xpathElement, webDriver) {
		let msg = false
		while (webDriver.testAlertPresentAndClose()) {
			if (!msg) {
				console.log(['A possible attack was found at', url, 'in element', xpathElement].join(' '))
				let tmp = "/screen.png"
				console.log(tmp)
				webDriver.screenShot(tmp)
			}
			msg = true
		}
	}

	_sqlInOnPage(page) {
		console.log(['Starting sql injection attack on', page].join(' '))
	}
}