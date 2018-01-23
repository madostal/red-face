require('chromedriver')
const sleep = require('system-sleep')
let fs = require('fs')
const { Builder, By, Key, until } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver')

const CHROME_OPTIONS = {
	"args": ["--test-type", "--start-maximized"]
	// 'args': [
	// 	'--test-type', 'disable-web-security', '--log-level=3', '--silent', '--start-maximized', '--headless',
	// ],
	// 'prefs': {
	// 	'profile.managed_default_content_settings.images': 2,
	// },
}

const DEFAULT_CREDITS = 20 //2S
const DEFAULT_SLEEP_CREDIT_TIME = 1

class FailCreator {

	constructor() {
		this.credits = DEFAULT_CREDITS + 1
	}

	wait() {
		this.credits--

		//skip for first step
		if (this.credits === DEFAULT_CREDITS) return false
		require('deasync').sleep(DEFAULT_SLEEP_CREDIT_TIME)
		return this.credits <= 0
	}
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

		this.driver.manage().timeouts().implicitlyWait(1)
	}

	screenShot(path) {
		// this._simplePromiseGuard(() => this.driver.takeScreenshot()
		// .then((image, err) => {
		// 	console.log(['Failed to print screenshot from selenium:', err].join(' '))
		// 	require('fs').writeFile(path, image, 'base64', (err) => {
		// 		console.log(['Failed to print screenshot from selenium:', err].join(' '))
		// 	})
		// }))

		this.driver.takeScreenshot().then((data) => {
			fs.writeFile('a.png', data.replace(/^data:image\/png;base64,/, ''), 'base64', (err) => {
				if (err) throw err
			})
		})

	}

	async goTo(url) {
		await this.driver.get(url)
	}

	async doLogin(login, psw, xpForm, xpLogin, xpPsw, failCreator = new FailCreator()) {
		let errLoop = false
		if (!failCreator.wait()) {
			await this.driver
				.findElement(By.xpath(xpLogin))
				.sendKeys(Key.chord(Key.CONTROL, 'a'), login)
				.catch(() => errLoop = true)
			if (errLoop) {
				return await this.doLogin(login, psw, xpForm, xpLogin, xpPsw, failCreator)
			}

			await this.driver
				.findElement(By.xpath(xpPsw))
				.sendKeys(Key.chord(Key.CONTROL, 'a'), psw)
				.catch(() => errLoop = true)
			if (errLoop) {
				return await this.doLogin(login, psw, xpForm, xpLogin, xpPsw, failCreator)
			}

			await this.driver
				.findElement(By.xpath(xpForm))
				.submit()
				.catch(() => errLoop = true)
			if (errLoop) {
				return await this.doLogin(login, psw, xpForm, xpLogin, xpPsw, failCreator)
			}
			return true
		}
		return false
	}

	async getDocumentText() {
		let res
		await this.driver.executeAsyncScript(() => {
			arguments[arguments.length - 1](document.body.textContent)
		}).then(d => res = d)
		return res
	}

	// goTo(url, guardTime = GUARD_LOCK_TIME_MS) {
	// 	this._simplePromiseGuard(() => this.driver.get(url), guardTime)
	// }

	// goToAsynch(url) {
	// 	this.driver.get(url)
	// }

	async closeDriver() {
		await this.driver.quit()
	}

	// extractAllLinks() {
	// 	return this._simplePromiseGuard(() =>
	// 		this.driver.executeAsyncScript(function () {
	// 			let callback = arguments[arguments.length - 1]

	// 			let data = [], l = document.links
	// 			for (let i = 0; i < l.length; i++) {
	// 				data.push(l[i].href)
	// 			}
	// 			callback(data)
	// 		})
	// 	)
	// }

	// hasWritableElements() {
	// 	return this._simplePromiseGuard(() =>
	// 		this.driver.executeAsyncScript(function () {
	// 			let callback = arguments[arguments.length - 1]

	// 			let selector = 'input:not([readonly])[type="text"], input[type="password"], textarea'
	// 			callback(document.querySelectorAll(selector).length > 0)
	// 		})
	// 	)
	// }

	// goBack(guardTime = GUARD_LOCK_TIME_MS) {
	// 	return this._simplePromiseGuard(() =>
	// 		this.driver.executeAsyncScript(function () {
	// 			let callback = arguments[arguments.length - 1]
	// 			history.back()
	// 			callback(null)
	// 		}), guardTime)
	// }

	// doLogin(login, psw, xpForm, xpLogin, xpPsw, guardTime = GUARD_LOCK_TIME_MS) {
	// 	let data = [login, psw, xpForm, xpLogin, xpPsw]

	// 	return this._simplePromiseGuard(() =>
	// 		this.driver.executeAsyncScript((data) => {
	// 			let tickets = 1000

	// 			let callback = arguments[arguments.length - 1]

	// 			const getElementByXpath = (path) => {
	// 				return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
	// 			}

	// 			const fillLoginName = (path, data) => {
	// 				// let tmp = getElementByXpath(data[3])
	// 				// tmp.value = data[0]

	// 				let tmp = getElementByXpath(path)
	// 				if (!tmp) {
	// 					console.log("RETURN FALSE")
	// 					return false
	// 				}
	// 				tmp.value = data
	// 				return true
	// 			}

	// 			const fillLoginPsw = (path, data) => {
	// 				let tmp = getElementByXpath(path)
	// 				if (!tmp) {
	// 					console.log("RETURN FALSE")
	// 					return false
	// 				}
	// 				tmp.value = data[1]
	// 				return true
	// 			}

	// 			const submitForm = (path) => {
	// 				// let tmp = getElementByXpath(data[2])
	// 				// tmp.submit()
	// 				let tmp = getElementByXpath(path)
	// 				if (!tmp) {
	// 					console.log("RETURN FALSE")
	// 					return false
	// 				}
	// 				tmp.submit()
	// 				return true
	// 			}

	// 			while (!fillLoginName(data[3], data[0])) {
	// 				if (--tickets <= 0) callback(null)
	// 				sleep(100)
	// 			}

	// 			while (!fillLoginPsw(data[4], data[1])) {
	// 				if (--tickets <= 0) callback(null)
	// 				sleep(100)
	// 			}

	// 			while (!submitForm(data[2])) {
	// 				if (--tickets <= 0) callback(null)
	// 				sleep(100)
	// 			}

	// 			callback(null)
	// 		}, data), guardTime)
	// }

	// getDocumentText(guardTime = GUARD_LOCK_TIME_MS) {
	// 	return this._simplePromiseGuard(() =>
	// 		this.driver.executeAsyncScript(function () {
	// 			let callback = arguments[arguments.length - 1]

	// 			callback(document.body.textContent)
	// 		}), guardTime)
	// }

	// /**
	//  * function execute() {
	// 		YOUR CODE
	// 	}
	//  *
	//  * @param {*} script
	//  * @param {*} guardTime
	//  */
	// executeScript(script, params, guardTime = GUARD_LOCK_TIME_MS) {
	// 	return this._simplePromiseGuard(() =>
	// 		this.driver.executeAsyncScript((script, params) => {
	// 			let callback = arguments[arguments.length - 1]

	// 			eval(script)
	// 			callback(execute(params))
	// 		}, script, params), guardTime)
	// }

	// testAlertPresentAndClose(guardTime = GUARD_LOCK_TIME_MS) {
	// 	return this._simplePromiseGuard(new Promise((resolve, reject) => {

	// 		this.driver.switchTo().alert().then(() => {
	// 			this.driver.switchTo().alert().accept()
	// 			resolve(true)
	// 		},
	// 			() => {
	// 				resolve(false)
	// 			})


	// 	}), guardTime)
	// }

	// sendKeys(xPath, text) {
	// 	this.driver.findElement(By.xpath(xPath)).sendKeys(text)
	// }

	// click(xPath) {
	// 	this.driver.findElement(By.xpath(xPath)).click()
	// }

	// _simplePromiseGuard(fn, sleepTime = GUARD_LOCK_TIME_MS) {
	// 	let returnData
	// 	let state = false
	// 	if (typeof fn === 'function') {
	// 		fn()
	// 			.then((data) => {
	// 				returnData = data
	// 				state = true
	// 			})
	// 	}
	// 	else {
	// 		fn
	// 			.then((data) => {
	// 				returnData = data
	// 				state = true
	// 			})
	// 	}

	// 	while (!state) {
	// 		sleep(sleepTime)
	// 	}
	// 	return returnData
	// }
}