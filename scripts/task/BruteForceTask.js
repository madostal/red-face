const jetpack = require('fs-jetpack')
const stringSimilarity = require('string-similarity')
const taskParent = require('./TaskParent.js')
const WebDriver = require('../utils/WebDriver')
const library = require('../utils/Library')
const sleep = require('system-sleep')
const { spawn } = require('child_process')


module.exports = class BruteForceTask extends taskParent {

	constructor(jsonconfig, configPath) {
		super(jsonconfig)
		this.configPath = configPath
		this.listOfChilds = []
		// this.testik = new WebDriver()
		// this.testik.goTo('https://www.google.cz/', 0)
	}

	start() {
		let serverHome = this._createUri(this.jsonconfig.serverHome, this.jsonconfig.taskdata.bruteforcetab.data.location)
		// let webDriver = new WebDriver()
		console.log(this.jsonconfig.taskdata.bruteforcetab.data)
		console.log('Starting BruteForceTask')
		console.log(['Location of login form is: ', this.jsonconfig.taskdata.bruteforcetab.data.loginFormXPathExpr].join(''))
		console.log(['Location of login name input is: ', this.jsonconfig.taskdata.bruteforcetab.data.loginNameXPathExpr].join(''))
		console.log(['Location of login password input is: ', this.jsonconfig.taskdata.bruteforcetab.data.loginPswXPathExpr].join(''))

		let data = null
		if (this.jsonconfig.taskdata.bruteforcetab.data.useLoginNamesDefault) {
			let fileData = this._parseInputData(jetpack.read('./task_settings/defaulbruteforce').split(/\r?\n/))
			data = this._createCombos(fileData[0], fileData[1])
		}
		else {
			data = this._createCombos(this.jsonconfig.taskdata.bruteforcetab.data.loginNames.split(/\r?\n/), this.jsonconfig.taskdata.bruteforcetab.data.loginPsws.split(/\r?\n/))
		}
		let totalToTest = data.length
		console.log(data)
		let countOfProc = this.jsonconfig.taskdata.bruteforcetab.data.nodes
		data = this._chunkArr(data, Math.floor(data.length / countOfProc))
		// console.log(data)ss
		console.log(['There are ', data.length, ' combination for test on ', countOfProc, ' snodes'].join(''))

		let startTime = new Date()
		let count = 0
		let rem = data.length

		//let listOfChilds = []
		for (let i = 0; i < data.length; i++) {
			let path = ['writable', '/', 'tmp', '/', 'red_face_config_', 'bruteforce', '_', Date.now(), '_', library.getRandomTextInRange(), '.txt'].join('')
			console.log(path)
			jetpack.write(path, data[i])

			const process = spawn('node', ['./task/BruteForceSubTask.js', path, this.configPath, serverHome, i], {
				stdio: ['ipc', 'pipe', 'pipe'],
			})
			this.listOfChilds.push(process)

			process.stdout.on('data', (data) => {
				console.log(`stderr: ${data}`)
			})

			process.stderr.on('data', (data) => {
				console.log(`stderr: ${data}`)
			})

			process.on('close', (code) => {
				rem--
				console.log('Closing code: ' + code)
			})

		}

		process.on('message', () => {
			for (let i = 0; i < this.listOfChilds.length; i++) {
				this.listOfChilds[i].send({ message: 'kill' })
			}
		})

		while (rem > 0) {
			sleep(1000)
		}

		console.log('TIME')
		console.log(startTime)
		console.log(new Date())
		console.log(['Avarage:', ((new Date() - startTime) / totalToTest), 'ms peer one test'].join(' '))
		console.log(['It took', library.timeDiffNow(startTime), totalToTest, 'accout-password tested'].join(' '))
	}

	/**
	 * Create uri -> example.com + where is login form located
	 * example.com + / + login -> example.com/login
	 *
	 * @param {String} uri
	 */
	_createUri(serverHomeInput, uri) {
		console.log(serverHomeInput + ' VS ' + uri)
		if (serverHomeInput.endsWith('/') && uri.startsWith('/')) {
			return [serverHomeInput, uri.substr(1)].join('')
		}

		if (!serverHomeInput.endsWith('/') && !uri.startsWith('/')) {
			return [serverHomeInput, '/', uri].join('')
		}

		return [serverHomeInput, uri].join('')
	}

	/**
	 * Parse input text loaded from file to array of [login, psw]
	 *
	 * @param {String[String[]]} data
	 */
	_parseInputData(data) {
		let arr1 = []; let arr2 = []; let tmp = arr1

		for (let loop of data) {
			if (loop.length === 0) {
				tmp = arr2
				continue
			}
			tmp.push(loop)
		}

		return [arr1, arr2]
	}

	/**
	 * Create all combinations of two arrays
	 *
	 * @param {String[]} array1
	 * @param {String[]} array2
	 */
	_createCombos(array1, array2) {
		let combos = []

		for (let i = 0; i < array1.length; i++) {
			for (let j = 0; j < array2.length; j++) {
				combos.push([array1[i], array2[j]])
			}
		}
		return combos
	}

	_chunkArr(array, chunk) {
		let out = []
		let i, j, temparray
		for (i = 0, j = array.length; i < j; i += chunk) {
			temparray = array.slice(i, i + chunk)
			// do whatever
			out.push(temparray)
		}
		return out
	}
}
