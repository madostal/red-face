require('chromedriver')
const request = require('request')
const { Builder, By, Key, until } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver')

const CHROME_OPTIONS = {
	'args': [
		// '--headless', '--test-type', 'disable-web-security', '--log-level=3', '--silent', '--no-sandbox', '--disable-gpu', '--log-path=NUL',
		"--test-type", "--start-maximized", "--profile-directory='red-face'"
	],
	'prefs': {
		'profile.managed_default_content_settings.images': 2,
	},
}

const DEFAULT_CREDITS = 20 //2S
const DEFAULT_SLEEP_CREDIT_TIME = 1

const DEFAULT_FAIL_CREDITS = 10

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


module.exports = class WebDriver {

	constructor() {
		this.driver = null
		this._init()
	}

	_init() {
		let state = false;

		(async () => {
			let chromeCapabilities = webdriver.Capabilities.chrome()
			chromeCapabilities.set('chromeOptions', CHROME_OPTIONS)

			this.driver = new webdriver.Builder()
				.forBrowser('chrome')
				.withCapabilities(chromeCapabilities)
				.build()

			await this.driver.manage().timeouts().implicitlyWait(100)
			await this.driver.manage().timeouts().pageLoadTimeout(30000)

			state = true
		})()

		require('deasync').loopWhile(() => { return !state })
	}

	async goTo(url) {
		await this.driver.get(url)
	}

	/**
	 * Test if url is html content by scanning http resp header if include text/html
	 *
	 * @param {bool} is html content
	 */
	async isHtml(url) {
		let isHtmlR = false
		const fire = () => {
			return new Promise(resolve => {
				request({
					url: url,
					method: 'HEAD',
					timeout: 10000,
				}, (error, response) => {
					if (error) {
						resolve()
						return
					}

					if (response.statusCode === 200
						&& response.headers['content-type']
						&& response.headers['content-type'].includes('text/html')) {
						isHtmlR = true
					}
					resolve()
				})
			})
		}
		await fire()
		return isHtmlR
	}

	async goToSafe(url) {
		let r = {
			wasHtml: false,
			statusCode: -1,
		}
		if (this.failCredits === 0) {
			console.error(['Selelnium driver fail on', url].join(' '))
			return r
		}

		this.failCredits--
		try {
			const fire = () => {
				return new Promise(resolve => {
					request({
						url: url,
						method: 'HEAD',
						timeout: 10000,
					}, (error, response) => {
						let isHtml = false
						if (error) {
							resolve()
							return
						}
						r.statusCode = response.statusCode
						if (response.headers['content-type']
							&& response.headers['content-type'].includes('text/html')) {
							isHtml = true
						}

						if (isHtml) {
							r.wasHtml = true
							let state = false;
							(async () => {
								try {
									await this.driver.get(url)
								} catch (error) {
									this._restartDriver()
									this.goTo(url)
								}
								state = true
							})()

							require('deasync').loopWhile(() => { return !state })
						}
						resolve()
					})
				})
			}
			await fire()

		} catch (err) {
			this._restartDriver()
		}
		this._restartCredits()
		return r
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

	async hasInlineScript() {
		let res
		await this.driver.executeAsyncScript(() => {
			let data = []
			try {
				for (let i = 0; i < window.frames.length; i++) {
					let tmp = window.frames[i].document.scripts
					for (let j = 0; j < tmp.length; j++) {
						data.push(tmp[j])
					}
				}
			} catch (e) { /* CORS */ }
			let tmp = document.scripts
			for (let i = 0; i < tmp.length; i++) {
				data.push(tmp[i])
			}
			let hasInline = false
			for (let i = 0; i < tmp.length; i++) {
				if (!tmp[i].src || tmp[i].src.ength === 0) {
					console.log(tmp[i])
					console.log(tmp[i].src)
					hasInline = true
					break
				}
			}
			arguments[arguments.length - 1](hasInline)
		}).then(d => res = d)
		return res
	}

	async hasCrossOriginAllowed(reqUrl) {
		let res
		await this.driver.executeAsyncScript((url) => {
			const oReq = new XMLHttpRequest()
			try {
				oReq.addEventListener("load", reqListener = () => {
					console.log(true)
					arguments[arguments.length - 1](false)
				})

				oReq.addEventListener("error", errListener = () => {
					console.log(false)
					arguments[arguments.length - 1](true)
				})

				oReq.open("GET", url);
				oReq.send()
			} catch (e) {
				arguments[arguments.length - 1](true)
			}
		}, reqUrl).then((d) => { res = d; })
		console.log('RETURNING ' + res)
		return res
	}

	async closeDriver() {
		await this.driver.quit()
	}

	/**
	 * Return WebElement
	 */
	async getElement(xpath) {
		return await this.driver.findElement(By.xpath(xpath))
	}

	/**
	 * Return array of elements
	 *
	 * @param {string} xpath
	 */
	async getElements(xpath) {
		return await this.driver.findElements(By.xpath(xpath))
	}

	/**
	 * Return array of elements
	 *
	 * @param {array} arrayXPath
	 */
	async getElementsFromArray(arrayXPath) {
		let res = []
		for (let i = 0; i < arrayXPath.length; i++) {
			res.push(...(await this.getElements(arrayXPath[i])))
		}
		return res
	}

	/**
	 * Write specific text to selenium element
	 *
	 * @param {selenium element} element
	 * @param {string} keys
	 */
	async sendKeysToElement(element, keys) {
		let err = false
		await element.sendKeys(Key.chord(Key.CONTROL, 'a'), keys).catch((e) => {
			err = true
		})
		if (err) {
			let xp = await this.findXPathOfElement(element).catch((e) => { })
			console.log('CANNOT WRITE TO: ' + xp)
		}
	}

	/**
	 * Return true, if alert is present
	 *
	 * Close if present
	 *
	 */
	async testAlertPresentAndClose() {
		let res

		await this.driver.switchTo().alert().then(() => {
			this.driver.switchTo().alert().accept()
			res = true
		}, () => {
			res = false
		})
		return res
	}

	/**
	 * Send form of webelement - if exist
	 *
	 * @param {WebElement} el
	 */
	async sendFormIfExist(el) {
		let res
		await this.driver.executeAsyncScript((e) => {
			if (e.form) {
				e.form.submit()
			}
			arguments[arguments.length - 1](res)
		}, el).then(d => res = d).catch(() => { })
	}

	/**
	 * Return xpath of selenium element
	 *
	 * @param {WebElement} el
	 */
	async findXPathOfElement(el) {
		let res

		await this.driver.executeAsyncScript((e) => {
			const createXPathFromElement = (elm) => {
				let allNodes = document.getElementsByTagName('*');
				for (let segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
					if (elm.hasAttribute('id')) {
						let uniqueIdCount = 0
						for (let n = 0; n < allNodes.length; n++) {
							if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
							if (uniqueIdCount > 1) break
						}
						if (uniqueIdCount == 1) {
							segs.unshift('id("' + elm.getAttribute('id') + '")');
							return segs.join('/');
						} else {
							segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
						}
					} else if (elm.hasAttribute('class')) {
						segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
					} else {
						for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
							if (sib.localName == elm.localName) i++
						}
						segs.unshift(elm.localName.toLowerCase() + '[' + i + ']')
					}
				}
				return segs.length ? '/' + segs.join('/') : null
			}
			arguments[arguments.length - 1](createXPathFromElement(e))
		}, el).then(d => res = d).catch(e => console.log(e))
		return res
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

	/**
	 * Set default credits after succ goToSafe
	 */
	_restartCredits() {
		this.failCredits = DEFAULT_FAIL_CREDITS
	}

	/**
	 * Close actual driver - if fail
	 * And start new
	 */
	_restartDriver() {
		this.closeDriver()
		this._init()
	}
}