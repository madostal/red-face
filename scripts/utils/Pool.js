const library = require('./Library.js')
const fs = require('fs')
const { spawn } = require('child_process')
const taskHome = require('../task/taskHome.js')
const logger = require('../Logger.js')
const database = require('./Database.js')
const TMP_FOLDER_PATH = './tmp_folder'

const DEFAULT_POOL_SIZE = 2

module.exports = class Pool {

	constructor(io, logFolderPath) {
		this.allowProcess = DEFAULT_POOL_SIZE
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

		this.insertNewTaskToDb({
			taskName: data.taskName,
			serverHome: data.serverHome,
			state: taskHome.TaskState.created,
			taskKey: library.getRandomTextInRange(10),
			configPath: configFile,
			logPath: this._createLogFile(data.taskName)
		})
	}

	insertNewTaskToDb(params) {
		database.connection.query('INSERT INTO task SET ?', params, (err, result) => {
			if (err) {
				logger.log('error', err)
				throw err
			}
			this.poolQueue.push(result.insertId)
			this._forceStart()
		})
	}

	_startProcess(id) {
		let logFileName = 'tmp.txt'
		this.activeProcess++

		let params = [taskHome.TaskState.running, library.getMySQLTime(), id]
		database.connection.query('UPDATE task SET state = ?, startTime = ?  WHERE id = ?', params, (err) => {
			if (err) {
				logger.log('error', err)
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
			this._appendDataToFile('STD ERROR', logFileName)
			this._appendDataToFile(data, logFileName)
		})

		process.on('close', (code) => {
			let taskFinishedState = (code === 0) ? taskHome.TaskState.done : taskHome.TaskState.failed

			let endTime = library.getMySQLTime()

			let params = [taskFinishedState, endTime, id]
			database.connection.query('UPDATE task SET state = ?, endTime = ? WHERE  id= ? ', params, (err) => {
				if (err) {
					logger.log('error', err)
					throw err
				}
			})

			this.activeProcess--
			this.processMap.delete(id)

			this.io.emit('taskdone', {
				running: this.activeProcess,
				pending: this.poolQueue.length,
				taskdone: id,
				endTime: endTime,
			})
			this.io.emit('update-overview', {
				running: this.activeProcess,
				pending: this.poolQueue.length,
				taskdone: id,
				endTime: endTime,
			})
			this._forceStart()
		})

		process.on('message', (data) => {
			logFileName = data.file
		})
	}

	_createConfigFile(taskname) {
		return [
			'writable',
			'/',
			'config',
			'/',
			'red_face_config_',
			taskname,
			'_',
			Date.now(),
			'_',
			library.getRandomTextInRange(),
			'.txt',
		].join('')
	}

	_createLogFile(taskname) {
		let file = [
			'writable',
			'/',
			this.logFolderPath,
			'/',
			'red_face_log_',
			taskname,
			'_',
			Date.now(),
			'_',
			library.getRandomTextInRange(),
			'.txt',
		].join('')
		this._appendDataToFile('Starting...\n', file)
		return file
	}

	_createBruteForcePswFile() {
		return [
			'writable',
			'/',
			TMP_FOLDER_PATH,
			'/',
			'red_face_taks_psw',
			'_',
			Date.now(),
			'_',
			library.getRandomTextInRange(),
			'.txt'
		].join('')
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
		database.connection.query('SELECT * FROM TASK WHERE ID = ?', [id], (err, result) => {
			if (err) {
				logger.log('error', err)
				throw err
			}
			let rowRes = result[0]
			this.insertNewTaskToDb({
				taskName: rowRes.taskName,
				serverHome: rowRes.serverHome,
				state: taskHome.TaskState.created,
				taskKey: library.getRandomTextInRange(10),
				configPath: rowRes.configPath,
				logPath: this._createLogFile(rowRes.taskName)
			})
		})
	}

	removeTask(id) {
		database.connection.query('SELECT * FROM TASK WHERE ID = ?', [id], (err, result) => {
			if (err) {
				logger.log('error', err)
				throw err
			}
			let rowRes = result[0]
			if (rowRes.state === taskHome.TaskState.running) {
				this.killTask(rowRes.id)
			}

			database.connection.query('SELECT * FROM TASK WHERE configPath = ?', [rowRes.configPath], (err, result) => {
				if (err) {
					logger.log('error', err)
					throw err
				}
				database.connection.query('DELETE FROM TASK WHERE ID = ?', [id], (err) => {
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
			result.forEach(e => this.removeTask(e.id, true))
		})
	}

	/**
	 * After resize pool, start task in queue
	 */
	_forceStart() {
		for (let i = 0; i < this.getAllowProcess() - this.getCountOfRunningProcess(); i++) {
			if (this.poolQueue.length !== 0) {
				this._startProcess(this.poolQueue.shift())
			} else {
				break
			}
		}
	}

	/**
	 *Return number of workers which are available for testing
	 */
	getAllowProcess() {
		return this.allowProcess
	}

	setAllowProcess(num) {
		this.allowProcess = num
		this._forceStart()
	}

	/**
	 * Return count of running process
	 */
	getCountOfRunningProcess() {
		return this.activeProcess
	}

	/**
	 * Return count of task in queue
	 */
	getActualQueueSize() {
		return this.poolQueue.length
	}
}