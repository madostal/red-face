const library = require('./Library.js')
const fs = require('fs')
const { spawn } = require('child_process')
const taskHome = require('../task/taskHome.js')
const logger = require('../Logger.js')
const database = require('./Database.js')
const TMP_FOLDER_PATH = './tmp_folder'

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

		let configFile = this._createConfigFile(data.taskName)
		this._appendDataToFile(JSON.stringify(data), configFile)

		let params = { taskName: data.taskName, serverHome: data.serverHome, state: taskHome.TaskState.created, taskKey: library.getRandomTextInRange(10), configPath: configFile, logPath: this._createLogFile(data.taskName) }
		this.insertNewTaskToDb(params)
	}

	insertNewTaskToDb(params) {
		database.connection.query('INSERT INTO task SET ?', params, (err, result) => {
			if (err) {
				console.error(err)
				throw err
			}
			let idTask = result.insertId
			if (this.activeProcess < this.allowProcess) {
				this._startProcess(idTask)
			}
			else {
				this.poolQueue.push(idTask)
			}
		})
	}

	_startProcess(id) {

		let logFileName = 'tmp.txt'
		this.activeProcess++

		let params = [taskHome.TaskState.running, library.getMySQLTime(), id]
		database.connection.query('UPDATE task SET state = ?, startTime = ?  WHERE id = ?', params, (err) => {
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
			this._appendDataToFile(data, logFileName)
			this.io.emit(['detail-', id].join(''), { 'data': data.toString('utf8') })

		})

		process.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`)
			this._appendDataToFile('STD ERROR', logFileName)
			this._appendDataToFile(data, logFileName)
		})

		process.on('close', (code) => {
			let taskFinishedState = (code === 0) ? taskHome.TaskState.done : taskHome.TaskState.killed

			let endTime = library.getMySQLTime()

			let params = [taskFinishedState, endTime, id]
			database.connection.query('UPDATE task SET state = ?, endTime = ? WHERE  id= ? ', params, (err) => {
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

	_createConfigFile(taskname) {
		return ['writable', '/', 'config', '/', 'red_face_config_', taskname, '_', Date.now(), '_', library.getRandomTextInRange(), '.txt'].join('')
	}

	_createLogFile(taskname) {
		let file = ['writable', '/', this.logFolderPath, '/', 'red_face_log_', taskname, '_', Date.now(), '_', library.getRandomTextInRange(), '.txt'].join('')
		this._appendDataToFile('Starting...\n', file)
		return file
	}

	_createBruteForcePswFile() {
		let file = ['writable', '/', TMP_FOLDER_PATH, '/', 'red_face_taks_psw', '_', Date.now(), '_', library.getRandomTextInRange(), '.txt'].join('')
		return file
	}

	_appendDataToFile(message, file) {
		fs.appendFileSync(file, message)
	}

	killTask(taskId) {
		let proc = this.processMap.get(taskId)
		if (!proc) {
			console.log('Proces is empty, err')
			return
		}
		proc.send({ message: "kill" })
		setTimeout(() => {
			proc.kill('SIGINT');
		}, 1000)
	}

	repeatTask(id) {
		let params = [id]
		database.connection.query('SELECT * FROM TASK WHERE ID = ?', params, (err, result) => {
			if (err) {
				logger.log('error', err)
				throw err
			}
			let rowRes = result[0]
			let params = { taskName: rowRes.taskName, serverHome: rowRes.serverHome, state: taskHome.TaskState.created, taskKey: library.getRandomTextInRange(10), configPath: rowRes.configPath, logPath: this._createLogFile(rowRes.taskName) }
			this.insertNewTaskToDb(params)
		})
	}

	removeTask(id) {
		let params = [id]
		database.connection.query('SELECT * FROM TASK WHERE ID = ?', params, (err, result) => {
			if (err) {
				logger.log('error', err)
				throw err
			}
			let rowRes = result[0]
			console.log(rowRes)
			if (rowRes.state === taskHome.TaskState.running) {
				this.killTask(rowRes.id)
			}
			let params = [rowRes.configPath]
			database.connection.query('SELECT * FROM TASK WHERE configPath = ?', params, (err, result) => {
				if (err) {
					logger.log('error', err)
					throw err
				}

				let params = [id]
				database.connection.query('DELETE FROM TASK WHERE ID = ?', params, (err) => {
					if (err) {
						logger.log('error', err)
						throw err
					}
				})

				if (result.length === 1) {
					//delete config file file
					fs.unlink(result[0].configPath, (err) => {
						if (err) {
							logger.log('error', err)
							throw err
						}
					})
				}
				//delete log file
				fs.unlink(result[0].logPath, (err) => {
					if (err) {
						logger.log('error', err)
						throw err
					}
				})
			})
		})
	}

	removeAllTasks() {
		database.connection.query('SELECT id FROM task', (err, result) => {
			if (err) {
				logger.log('error', err)
				throw err
			}
			for (let i = 0; i < result.length; i++) {
				this.removeTask(result[i].id, true)
			}
		})
	}
}