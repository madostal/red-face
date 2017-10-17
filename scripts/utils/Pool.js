const library = require('./Library.js')
const fs = require('fs')
const async = require('async')
const { spawn } = require('child_process')
const taskHome = require('../task/taskHome.js')
const logger = require('../Logger.js')
const jetpack = require('fs-jetpack')
const database = require('./Database.js')

const TMP_FOLDER_PATH = './tmp_folder'
const DEFAULT_BRUTE_FORCE_PATH = 'task_settings/defaulbruteforce.txt'

module.exports = class Pool {

	constructor(io, logFolderPath) {
		this.allowProcess = 2
		this.activeProcess = 0

		this.poolQueue = []

		this.logFolderPath = logFolderPath
		this.io = io
		this.processMap = new Map()
	}

	insertNewTask(data) {
		logger.log('debug', ['Insert new task ', JSON.stringify(data)].join(''))
		let self = this
		let params = { taskName: data.data.taskName, serverHome: data.data.serverHome, state: taskHome.TaskState.created, taskKey: library.getRandomTextInRange(10) }
		database.connection.query('INSERT INTO task SET ?', params, function (err, result) {
			if (err) {
				console.error(err)
				throw err
			}
			let idTask = result.insertId

			async.parallel([
				function (callback) {
					if (data.data.taskdata.othertab != null) {

						let params = { state: taskHome.TaskState.created, task_id: idTask, type: taskHome.TaskType.other }
						database.connection.query('INSERT INTO subTask SET ?', params, function (err, result) {
							if (err) {
								console.error(err)
								throw err
							}
							let idSubTask = result.insertId

							let params = { path: self._createLogFile('othertask'), subTask_id: idSubTask }
							database.connection.query('INSERT INTO log SET ?', params, function (err) {
								if (err) {
									console.error(err)
									throw err
								}
							})

							params = { testPortScan: data.data.taskdata.othertab.data.testPortScan, testJavascriptImport: data.data.taskdata.othertab.data.testJavascriptImport, testHttpHttps: data.data.taskdata.othertab.data.testHttpHttps, testGitConfig: data.data.taskdata.othertab.data.testGitConfig, subTask_id: idSubTask }
							database.connection.query('INSERT INTO otherTask SET ?', params, function (err, result) {
								if (err) {
									console.error(err)
									throw err
								}
								if (data.data.taskdata.othertab.data.testPortScan === true) {
									//is enable port scanning
									params = { from: data.data.taskdata.othertab.data.testPortScanDataFrom, to: data.data.taskdata.othertab.data.testPortScanDataTo, otherTask_id: result.insertId }
									database.connection.query('INSERT INTO portScan SET ?', params, function (err, result) {
										if (err) {
											console.error(err)
											throw err
										}
										callback(null)
									})
								}
								else {
									callback(null)
								}
							})
						})
					}
					else {
						callback(null)
					}
				},
				function (callback) {
					if (data.data.taskdata.bruteforcetab != null) {

						let params = { state: taskHome.TaskState.created, task_id: idTask, type: taskHome.TaskType.bruteForce }
						database.connection.query('INSERT INTO subTask SET ?', params, function (err, result) {
							if (err) {
								console.error(err)
								throw err
							}
							let idSubTask = result.insertId

							let params = { path: self._createLogFile('bruteforcetask'), subTask_id: idSubTask }
							database.connection.query('INSERT INTO log SET ?', params, function (err) {
								if (err) {
									console.error(err)
									throw err
								}
							})

							let fileName = (data.data.taskdata.bruteforcetab.data.idLoginNamesDefault) ? DEFAULT_BRUTE_FORCE_PATH : self._createBruteForcePswFile()

							if (!(data.data.taskdata.bruteforcetab.data.useLoginNamesDefault)) {
								jetpack.write(fileName, [data.data.taskdata.bruteforcetab.data.loginNames, data.data.taskdata.bruteforcetab.data.loginPsws].join('\r\n\r\n'))
							}

							params = { subTask_id: idSubTask, loginFormXPathExpr: data.data.taskdata.bruteforcetab.data.loginFormXPathExpr,
								loginNameXPathExpr: data.data.taskdata.bruteforcetab.data.loginNameXPathExpr, loginpswXPathExpr: data.data.taskdata.bruteforcetab.data.loginPswXPathExpr,
								 testFilePath: fileName, urlLocation: data.data.taskdata.bruteforcetab.data.location }

							database.connection.query('INSERT INTO bruteforceTask SET ?', params, function (err, result) {
								if (err) {
									console.error(err)
									throw err
								}
								callback(null)
							})
						})
					}
					else {
						callback(null)
					}
				}], function (err) {
				if (err) {
					console.error(err)
					throw err
				}

				if (self.activeProcess < self.allowProcess) {
					self._startProcess(idTask)
				}
				else {
					self.poolQueue.push(idTask)
				}
			})

		})
	}

	_startProcess(id) {
		let logFileName = 'tmp.txt'
		this.activeProcess++

		let params = [taskHome.TaskState.running, library.getMySQLTime(), id]
		database.connection.query('UPDATE task SET state = ?, startTime = ?  WHERE id = ?', params, function (err) {
			if (err) {
				console.error(err)
				throw err
			}
		})

		this.io.emit('taskstart', 'TASK ' + id + ' STARTED :-)')

		const process = spawn('node', ['task/Core.js', id], {
			stdio: ['ipc', 'pipe', 'pipe'],
		})

		this.processMap.set(id, process)

		process.stdout.on('data', (data) => {
			console.log(`stderr: ${data}`)
			this._appendLog(data, logFileName)
			this.io.emit(['detail-', id].join(''), { 'data': data.toString('utf8') })

		})

		process.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`)
			this._appendLog('STD ERROR', logFileName)
			this._appendLog(data, logFileName)
		})

		process.on('close', (code) => {
			let taskFinishedState = (code === 0) ? taskHome.TaskState.done : taskHome.TaskState.killed

			let endTime = library.getMySQLTime()

			let params = [taskFinishedState, endTime, id]
			database.connection.query('UPDATE task SET state = ?, endTime = ? WHERE  id= ? ', params, function (err) {
				if (err) {
					throw err
				}
			})

			this.activeProcess--
			this.processMap.delete(id)
			console.log('Task id: ' + id + ' closed...')

			this.io.emit('taskdone', { 'running': this.activeProcess, 'pending': this.poolQueue.length, 'taskdone': id, 'endTime': endTime })
			this.io.emit('update-overview', { 'running': this.activeProcess, 'pending': this.poolQueue.length, 'taskdone': id, 'endTime': endTime })
			if (this.poolQueue.length !== 0) {
				this._startProcess(this.poolQueue.shift())
			}
		})

		process.on('message', (data) => {
			logFileName = data.file
		})
	}

	_createLogFile(taskname) {
		let file = [this.logFolderPath, '/', 'red_face_log_', taskname, '_', Date.now(), '_', library.getRandomTextInRange(), '.txt'].join('')
		this._appendLog('Starting...\n', file)
		return file
	}

	_createBruteForcePswFile() {
		let file = [TMP_FOLDER_PATH, '/', 'red_face_taks_psw', '_', Date.now(), '_', library.getRandomTextInRange(), '.txt'].join('')
		return file
	}

	_appendLog(message, file) {
		fs.appendFileSync(file, message)
	}

	killTask(taskId) {
		let proc = this.processMap.get(taskId)
		if (proc === null) {
			console.log('Proces is empty, err')
			return
		}

		proc.kill('SIGINT')
	}
}