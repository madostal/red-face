const fs = require('fs')
const async = require('async')
const moment = require('moment')
const { spawn } = require('child_process')
const taskHome = require('../task/task-home.js')
const logger = require('../logger.js')
const library = require('./library.js')
const database = require('./database.js')

const TMP_FOLDER_PATH = './tmp_folder'

/**
 * Default size of pool -  How many task can run paraller?
 */
const DEFAULT_POOL_SIZE = 2

module.exports = class Pool {

	constructor(io) {
		//on server start, set ALWAYS default size
		this.allowProcess = DEFAULT_POOL_SIZE

		//count of actual running process
		this.activeProcess = 0

		//standard queue - task waiting for free workers
		this.poolQueue = []

		this.io = io

		//running process are stored in map
		//sometimes is called stop task from user
		this.processMap = new Map()
	}

	insertNewTask(data) {
		logger.log('debug', ['Insert new task ', JSON.stringify(data)].join(''))

		let configFile = this._createConfigFile(data.taskName)
		this._appendDataToFile(JSON.stringify(data), configFile)

		this.insertNewTaskToDb({
			taskName: data.taskname,
			serverHome: data.serverHome,
			state: taskHome.TaskState.created,
			taskKey: library.getRandomTextInRange(10),
			configPath: configFile,
			logPath: this._createLogFile(data.taskName)
		})
	}

	/**
	 *  Insert new task to db and start it
	 */
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
		let logFileName
		this.activeProcess++

		async.waterfall([
			(callback) => {
				let params = [taskHome.TaskState.running, library.getMySQLTime(), id]
				database.connection.query('UPDATE task SET state = ?, startTime = ?  WHERE id = ?', params, (err) => {
					if (err) {
						logger.log('error', err)
						throw err
					}
					callback()
				})
			},
			(callback) => {
				database.connection.query('SELECT * FROM task WHERE id = ?', [id], (err, fields) => {
					if (err) {
						throw err
					}
					logFileName = fields[0].logPath
					callback()
				})
			},
		], () => {
			this.io.emit('task-start', { id: id })

			const process = spawn('node', ['task/core.js', id], {
				stdio: ['ipc', 'pipe', 'pipe'],
			})

			this.processMap.set(id, process)

			const procesOut = (data) => {
				data = this._formatLogRow(data)
				this._appendDataToFile(data, logFileName)
				this.io.emit(['detail-', id].join(''), { 'data': data.toString('utf8') })
			}

			process.stdout.on('data', (data) => {
				procesOut(data)
			})

			process.stderr.on('data', (data) => {
				procesOut(data)
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

				this.io.emit('task-done', {
					running: this.activeProcess,
					pending: this.poolQueue.length,
					taskdone: id,
					endTime: endTime,
				})
				this._forceStart()
			})
		})
	}

	/**
	 * Add time stamp to row log
	 *
	 * @param {string} data
	 */
	_formatLogRow(data) {
		return [moment().format('DD.MM.YYYY hh:mm:ss'), ': ', data].join('')
	}

	/**
	 * Create path to config file
	 *
	 * @param {string} taskname
	 */
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

	/**
	 * Create path to log file
	 *
	 * @param {string} taskname
	 */
	_createLogFile(taskname) {
		let file = [
			'writable',
			'/',
			'log_folder',
			'/',
			'red_face_log_',
			taskname,
			'_',
			Date.now(),
			'_',
			library.getRandomTextInRange(),
			'.txt',
		].join('')
		return file
	}

	/**
	 * Create path to bruteforce config file
	 */
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

	/**
	 * Append new row to log file
	 *
	 * @param {string} message
	 * @param {string} file
	 */
	_appendDataToFile(message, file) {
		fs.appendFileSync(file, message)
	}

	/**
	 * Kill proces by id
	 *
	 * @param {int} taskId
	 */
	killTask(taskId) {
		let proc = this.processMap.get(taskId)
		if (!proc) {
			console.log('Proces is empty, err')
			return
		}
		proc.send({ message: "kill" })
		setTimeout(() => {
			proc.kill('SIGINT');
		}, 5000)
	}

	/**
	 * Repeat task by id
	 *
	 * @param {int} id
	 */
	repeatTask(id) {
		database.connection.query('SELECT * FROM task WHERE ID = ?', [id], (err, result) => {
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
						}
					})
				}
				//delete log file
				fs.unlink(result[0].logPath, (err) => {
					if (err) {
						logger.log('error', err)
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