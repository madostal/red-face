require("chromedriver");
var sleep = require("system-sleep");

var webdriver = require("selenium-webdriver"),
	By = webdriver.By,
	until = webdriver.until;

const CHROME_OPTIONS = {
	// 'args': ['--test-type', '--start-maximized', '--headless']
	'args': [
		'--test-type', 'disable-web-security'
	],
	"prefs": {
		"profile.managed_default_content_settings.images": 2
	}
};

const GUARD_LOCK_TIME_MS = 1000;

module.exports = class WebDriver {

	constructor() {
		this.driver = null;
		this._init();
	}

	_init() {
		var chromeCapabilities = webdriver.Capabilities.chrome();
		chromeCapabilities.set('chromeOptions', CHROME_OPTIONS);

		this.driver = new webdriver.Builder()
			.forBrowser('chrome')
			.withCapabilities(chromeCapabilities)
			.build();
	}

	screenShot(path) {
		this._simplePromiseGuard(() => this.driver.takeScreenshot()
			.then(function (image, err) {
				require('fs').writeFile(path, image, 'base64', function (err) {
					//
				});
			}));
	}

	goTo(url, guardTime = GUARD_LOCK_TIME_MS) {
		this._simplePromiseGuard(() => this.driver.get(url), guardTime);
	}

	goToAsynch(url) {
		this.driver.get(url);
	}

	closeDriver() {
		this._simplePromiseGuard(() => this.driver.quit());
	}

	extractAllLinks() {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				var callback = arguments[arguments.length - 1];

				var data = [], l = document.links;
				for (var i = 0; i < l.length; i++) {
					data.push(l[i].href);
				}
				callback(data);
			})
		);
	}

	hasWritableElements() {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				var callback = arguments[arguments.length - 1];

				var selector = 'input[type="text"], input[type="password"], textarea';
				callback(document.querySelectorAll(selector.length > 0));
			})
		);
	}

	goBack(guardTime = GUARD_LOCK_TIME_MS) {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				var callback = arguments[arguments.length - 1];
				history.back();
				callback(null);
			}), guardTime);
	}

	doLogin(login, psw, xpForm, guardTime = GUARD_LOCK_TIME_MS) {
		var data = [login, psw, xpForm];
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function (data) {
				var callback = arguments[arguments.length - 1];

				console.log(data);
				function getElementByXpath(path) {
					return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				}

				var loginForm = getElementByXpath(data[2]);

				var userName = ["(", [data[2], "//input"].join(""), ")[1]"].join("");
				var psw = ["(", [data[2], "//input"].join(""), ")[2]"].join("");

				getElementByXpath(userName).value = data[0];
				getElementByXpath(psw).value = data[1];
				loginForm.submit();

				callback(null);
			}, data), guardTime);
	}

	getDocumentText(guardTime = GUARD_LOCK_TIME_MS) {
		return this._simplePromiseGuard(() =>
			this.driver.executeAsyncScript(function () {
				var callback = arguments[arguments.length - 1];

				callback(document.body.textContent);
			}), guardTime);
	}

	_simplePromiseGuard(fn, sleepTime = GUARD_LOCK_TIME_MS) {
		console.log(sleepTime);
		var returnData;
		var state = false;
		fn()
			.then((data) => {
				returnData = data;
				state = true;
			});

		while (!state) {
			sleep(sleepTime);
		}
		return returnData;
	}
}