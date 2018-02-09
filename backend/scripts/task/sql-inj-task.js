const url = require('url')
const queryString = require('query-string')

const taskParent = require('./task-parent.js')
const WebDriver = require('../utils/web-driver')

module.exports = class SqlInjTask extends taskParent {

	constructor(jsonconfig, url, crawlerRes) {
		super(jsonconfig)
		this.url = url
		this.crawlerRes = crawlerRes

		// this.webDriver = new WebDriver()
	}

	start() {
		console.log('SQLinj: Starting')
		if (this.jsonconfig.taskdata.sqltab.data.testForms) {
			this._testInputs()
		}

		if (this.jsonconfig.taskdata.sqltab.data._testParams) {
			this._testParams()
		}


		console.log('SQLinj: Finished')
	}

	_testInputs() {
		console.log('SQLinj: Starting scanning inputs')
		let webDriver = new WebDriver()

		let state = false;
		(async () => {
			await this.webDriver.closeDriver()
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })
		console.log('SQLinj: Scanning inputs finished')
	}

	_testParams() {
		console.log('SQLinj: Starting scanning url params')
		let webDriver = new WebDriver()

		let state = false;
		(async () => {
			await this.webDriver.closeDriver()
			state = true
		})()

		require('deasync').loopWhile(() => { return !state })
		console.log('SQLinj: Scanning url params finished')
	}
}