const LOG_FOLDER = './log_folder'
const SERVER_PORT = 4200
const jetpack = require('fs-jetpack');
const fs = require('fs')
const express = require('express')
const app = express()
const server = require('http')
	.createServer(app)
const io = require('socket.io')(server)
const cpuStat = require('cpu-stat')

const database = require('./utils/Database.js')

const poolInstance = new (require('./utils/pool.js'))(io, LOG_FOLDER)

const taskHome = require('./task/TaskHome.js')
const library = require('./utils/Library.js')
const logger = require('./Logger.js')

server.listen(SERVER_PORT)

/**
 * Create directory for storings logs
 */
const serverSetUp = () => {
	if (!fs.existsSync(LOG_FOLDER)) {
		fs.mkdirSync(LOG_FOLDER)
	}
}

/**
 * After reset server (if was some fail :-( ) its need check task which were in progress when server fails
 *
 * So set this task to failed state
 */
function checkDeadTasks() {
	let params = [taskHome.TaskState.killed, library.getMySQLTime(), taskHome.TaskState.running, taskHome.TaskState.created]
	database.connection.query('UPDATE task SET state = ?, endTime = ? WHERE (state = ? OR state = ?)', params, function (err) {
		if (err) {
			logger.log('error', err)
			throw err
		}
	})
}

io.on('connection', (socket) => {

	/**
	 * Get system statistics
	 */
	socket.on('get-system-stats', (input) => {
		cpuStat.usagePercent((err, percent) => {
			if (err) {
				return console.log(err)
			}
			let json = {
				cpu: percent,
				activeProcess: poolInstance.getCountOfRunningProcess(),
				maxProcess: poolInstance.getAllowProcess(),
				queueStatus: poolInstance.getActualQueueSize(),
			}
			socket.emit('system-stats', json)
		})
	})

	socket.on('set-system-settings', (input) => {
		if (input.maxActiveTasks) {
			let num = parseInt(input.maxActiveTasks)
			if (Number.isInteger(num)) {
				if (num > 0 && num < 100) {
					poolInstance.setAllowProcess(input.maxActiveTasks)
				}
			}
		}
	})

	/**
	 * On create new task
	 */
	socket.on('taskcreate', (input) => {
		let json = JSON.parse(input)
		io.emit('taskcreate', json.taskname)
		poolInstance.insertNewTask(json)
	})

	/**
	 * Return all tasks
	 */
	socket.on('give-me-tasks', (input) => {
		database.connection.query('SELECT * FROM task', [], function (err, fields) {
			if (err) {
				logger.log('error', err)
				throw err
			}
			io.emit('there-are-tasks', fields)
		})
	})

	socket.on('give-me-task-detail', (input) => {
		let splitKey = input.key.split('_')
		if (splitKey.length !== 2) {
			//possible wrong key
			io.emit('there-is-task-detail', null)
		}
		else {
			let params = [splitKey[0], splitKey[1]]
			database.connection.query('SELECT * FROM TASK WHERE ID = ? AND TASKKEY = ?', params, (err, fields) => {
				if (err) {
					logger.log('error', err)
					throw err
				}
				fields = fields[0]
				fields.log = jetpack.read(fields.logPath)
				io.emit('there-is-task-detail', fields)
			})
		}
	})

	socket.on('remove-task', (input) => {
		poolInstance.removeTask(input.id)
	})

	socket.on('repeat-task', (input) => {
		logger.log('debug', ['Repeat task id: ', input.id].join(''))
		poolInstance.repeatTask(input.id)
	})

	socket.on('stop-task', (input) => {
		logger.log('debug', ['Stop task id: ', input.id].join(''))
		poolInstance.killTask(input.id)
	})

	socket.on('remove-all-tasks', () => {
		poolInstance.removeAllTasks()
	})
})

serverSetUp()
checkDeadTasks()
