require('chromedriver');

var webdriver = require('selenium-webdriver'), 
	By = webdriver.By,
    until = webdriver.until;

		const CHROME_OPTRIONS = {
		//'args': ['--test-type', '--start-maximized', '--headless']
		'args': ['--test-type']
	};
	
module.exports =  class WebDriver {
	
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
		this.driver.takeScreenshot()
			.then(
				function(image, err) {
					require('fs').writeFile('out.png', image, 'base64', function(err) {
						console.log(err);
					});
				}
			);
	}
	
	goTo(url) {
		console.log(this.driver.get(url).then().extract().response());
	}
	
	closeDriver() {
		this.driver.quit();
	}
}