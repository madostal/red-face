require('chromedriver')
const sleep = require('system-sleep')

const webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until

const CHROME_OPTIONS = {
	// "args": ["--test-type", "--start-maximized", "--headless"]
	'args': [
//		'--test-type', 'disable-web-security', '--log-level=3', '--silent',
	],
	'prefs': {
	//	'profile.managed_default_content_settings.images': 2,
	},
}

const GUARD_LOCK_TIME_MS = 1000

module.exports = class WebDriver {

	constructor() {
		this.driver = null
		this._init()
	}

	_init() {
		let chromeCapabilities = webdriver.Capabilities.chrome()
		chromeCapabilities.set('chromeOptions', CHROME_OPTIONS)

		this.driver = new webdriver.Builder()
			.forBrowser('chrome')
			.withCapabilities(chromeCapabilities)
			.build()
	}

	screenShot(path) {
		this._simplePromiseGuard(() => this.driver.takeScreenshot()
			.then((image, err) => {
				console.log(['Failed to print screenshot from selenium:', err].join(' '))
				require('fs').writeFile(path, image, 'base64', (err) => {
					console.log(['Failed to print screenshot from selenium:', err].join(' '))
				})
			}))
	}

	goTo(url, guardTime = GUARD_LOCK_TIME_MS) {
		this._simplePromiseGuard(() => this.driver.get(url), guardTime)
	}

	goToAsynch(url) {
		this.driver.get(url)
	}

	closeDriver() {
		this._simplePromiseGuard(() => this.driver.quit())
	}

	extractAllLinks() {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				let callback = arguments[arguments.length - 1]

				let data = [], l = document.links
				for (let i = 0; i < l.length; i++) {
					data.push(l[i].href)
				}
				callback(data)
			})
		)
	}

	hasWritableElements() {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				let callback = arguments[arguments.length - 1]

				let selector = 'input[type="text"], input[type="password"], textarea'
				callback(document.querySelectorAll(selector).length > 0)
			})
		)
	}

	goBack(guardTime = GUARD_LOCK_TIME_MS) {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				let callback = arguments[arguments.length - 1]
				history.back()
				callback(null)
			}), guardTime)
	}

	doLogin(login, psw, xpForm, xpLogin, xpPsw, guardTime = GUARD_LOCK_TIME_MS) {
		let data = [login, psw, xpForm, xpLogin, xpPsw]
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript((data) => {

				let callback = arguments[arguments.length - 1]

				function getElementByXpath(path) {
					return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
				}

				getElementByXpath(data[3]).value = data[0]
				getElementByXpath(data[4]).value = data[1]
				getElementByXpath(data[2]).submit()

				callback(null)
			}, data), guardTime)
	}

	getDocumentText(guardTime = GUARD_LOCK_TIME_MS) {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				let callback = arguments[arguments.length - 1]

				callback(document.body.textContent)
			}), guardTime)
	}

	/**
	 * function execute() {
			YOUR CODE
		}
	 *
	 * @param {*} script
	 * @param {*} guardTime
	 */
	executeScript(script, params, guardTime = GUARD_LOCK_TIME_MS) {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript((script, params) => {
				let callback = arguments[arguments.length - 1]

				eval(script)
				callback(execute(params))
			}, script, params), guardTime)
	}

	testAlertPresentAndClose(guardTime = GUARD_LOCK_TIME_MS) {
		return this._simplePromiseGuard(new Promise((resolve, reject) => {

			this.driver.switchTo().alert().then(() => {
				this.driver.switchTo().alert().accept()
				resolve(true)
			},
				() => {
					resolve(false)
				})


		}), guardTime)
	}

	sendKeys(xPath, text) {
		this.driver.findElement(By.xpath(xPath)).sendKeys(text);
	}

	_simplePromiseGuard(fn, sleepTime = GUARD_LOCK_TIME_MS) {
		let returnData
		let state = false
		if (typeof fn === 'function') {
			fn()
				.then((data) => {
					returnData = data
					state = true
				})
		}
		else {
			fn
				.then((data) => {
					returnData = data
					state = true
				})
		}

		while (!state) {
			sleep(sleepTime)
		}
		return returnData
	}
}