require('chromedriver');
var sleep = require('system-sleep');

var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;

const CHROME_OPTRIONS = {
	//'args': ['--test-type', '--start-maximized', '--headless']
	'args': ['--test-type']
};

const GUARD_LOCK_TIME_MS = 1000;

module.exports = class WebDriver {

	constructor() {
		this.driver = null;
		this._init();
	}

	_init() {
		var chromeCapabilities = webdriver.Capabilities.chrome();
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

	goTo(url) {
		this._simplePromiseGuard(() => this.driver.get(url));
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

	_simplePromiseGuard(fn) {
		var returnData;
		var state = false;
		fn()
			.then((data) => {
				returnData = data;
				state = true;
			});

		while (!state) {
			sleep(GUARD_LOCK_TIME_MS);
		}
		return returnData;
	}
}