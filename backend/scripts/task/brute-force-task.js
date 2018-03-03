const jetpack = require('fs-jetpack')
const { spawn } = require('child_process')
const taskParent = require('./task-parent.js')
const library = require('../utils/library')

module.exports = class BruteForceTask extends taskParent {

	constructor(jsonconfig, configPath, isAuto, autoRes) {
		super(jsonconfig)
		this.configPath = configPath
		this.listOfChilds = []
		this.isAuto = isAuto
		this.autoRes = autoRes
	}

	start() {
		let logData = {
			text: 'Bruteforce attack',
			data: [],
		}
		if (this.isAuto && !this.autoRes) {
			logData.data.push({
				text: 'Bruteforce wasn\t found a login form',
				vulnerability: 3,
			})
		} else {

			let serverHome = this._createUri(this.jsonconfig.serverHome, this.jsonconfig.taskdata.bruteforcetab.data.location)

			console.log('Starting BruteForceTask')
			console.log(['Location of login form is: ', this.jsonconfig.taskdata.bruteforcetab.data.loginFormXPathExpr].join(''))
			console.log(['Location of login name input is: ', this.jsonconfig.taskdata.bruteforcetab.data.loginNameXPathExpr].join(''))
			console.log(['Location of login password input is: ', this.jsonconfig.taskdata.bruteforcetab.data.loginPswXPathExpr].join(''))

			let data = null
			if (this.jsonconfig.taskdata.bruteforcetab.data.useLoginNamesDefault) {
				let fileData = this._parseInputData(jetpack.read('./task_settings/defaulbruteforce').split(/\r?\n/))
				data = this._createCombos(fileData[0], fileData[1])
			} else {
				data = this._createCombos(this.jsonconfig.taskdata.bruteforcetab.data.loginNames.split(/\r?\n/), this.jsonconfig.taskdata.bruteforcetab.data.loginPsws.split(/\r?\n/))
			}

			let totalToTest = data.length

			let countOfProc = parseInt(this.jsonconfig.taskdata.bruteforcetab.data.nodes)
			if (!Number.isInteger(countOfProc) || countOfProc < 1) {
				//if input is wrong number
				console.log('Restarting cout of proc')
				countOfProc = 1
			}

			if (!this._isFloat(this.jsonconfig.taskdata.bruteforcetab.data.percentageDiff)) {
				this.jsonconfig.taskdata.bruteforcetab.data.percentageDiff = 80
			}

			data = this._chunkArr(data, Math.ceil(data.length / countOfProc))

			let startTime = new Date()
			let rem = data.length

			console.log(['Using diff ', this.jsonconfig.taskdata.bruteforcetab.data.percentageDiff, '%'].join(''))

			for (let i = 0; i < data.length; i++) {
				let path = ['writable', '/', 'tmp', '/', 'red_face_config_', 'bruteforce', '_', Date.now(), '_', library.getRandomTextInRange(), '.txt'].join('')
				jetpack.write(path, data[i])

				const process = spawn('node', ['./task/brute-force-sub-task.js', path, this.configPath, serverHome, i], {
					stdio: ['ipc', 'pipe', 'pipe'],
				})
				this.listOfChilds.push(process)

				let printMsg = (msg) => {
					msg = msg.slice(0, -1)
					let tmp = msg.split('|')
					console.log(tmp)
					if (tmp.length === 3) {
						logData.data.push({
							text: tmp[2],
							vulnerability: tmp[1],
						})
					} else {
						console.log(msg)
					}
				}

				process.stdout.on('data', (data) => {
					printMsg(data.toString('utf8'))
				})

				process.stderr.on('data', (data) => {
					printMsg(data.toString('utf8'))
				})

				process.on('close', (code) => {
					rem--
				})

			}

			process.on('message', () => {
				for (let i = 0; i < this.listOfChilds.length; i++) {
					this.listOfChilds[i].send({ message: 'kill' })
				}
			})

			while (rem > 0) {
				require('deasync').sleep(1000)
			}

			console.log(['Avarage:', ((new Date() - startTime) / totalToTest), 'ms peer one test'].join(' '))
			console.log(['It took', library.timeDiffNow(startTime), totalToTest, 'accout-password tested'].join(' '))
			console.log()

			if (logData.data.length === 0) {
				//not found
				logData.data.push({
					text: 'Bruteforce wasn\t found password',
					vulnerability: 1,
				})
			}
		}
		this.taskRes.data.push(logData)
		console.log('Bruteforce task finished')
		console.log('')
		return this.taskRes
	}

	/**
	 * Create uri -> example.com + where is login form located
	 * example.com + / + login -> example.com/login
	 *
	 * @param {String} uri
	 */
	_createUri(serverHomeInput, uri) {
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

	_chunkArr(arr, len) {
		let chunks = [], i = 0
		while (i < arr.length) {
			chunks.push(arr.slice(i, i += len))
		}
		return chunks
	}

	_isFloat(n) {
		return Number(n) === n && n % 1 !== 0;
	}
}
