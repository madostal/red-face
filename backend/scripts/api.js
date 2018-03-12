/**
 * Websocket port
 */
const SERVER_PORT = 4200

const jetpack = require('fs-jetpack')
const server = require('http')
	.createServer(require('express')())
const io = require('socket.io')(server)
const cpuStat = require('cpu-stat')

const database = require('./utils/database')
const taskHome = require('./task/task-home')
const library = require('./utils/library')
const logger = require('./logger')

const poolInstance = new (require('./utils/pool'))(io)

server.listen(SERVER_PORT)

/**
 * After reset server (if was some fail :-( ) its need check task which were in progress when server fails
 *
 * So set this task to failed state
 */
const checkDeadTasks = () => {
	let params = [taskHome.TaskState.killed, library.getMySQLTime(), taskHome.TaskState.running, taskHome.TaskState.created]
	database.connection.query('UPDATE task SET state = ?, endTime = ? WHERE (state = ? OR state = ?)', params, (err) => {
		if (err) {
			logger.log('error', err)
			throw err
		}
	})
}

/**
 * System wrapper around websocked connections, contains all methods for WS
 */
io.on('connection', (socket) => {

	/**
	 * Get system statistics
	 */
	socket.on('get-system-stats', () => {
		cpuStat.usagePercent((err, percent) => {
			if (err) {
				logger.log('error', err)
				throw err
			}
			database.connection.query('select state, count(*) as count from task group by state', (err, fields) => {
				if (err) {
					logger.log('error', err)
					throw err
				}
				socket.emit('system-stats', {
					cpu: percent,
					activeProcess: poolInstance.getCountOfRunningProcess(),
					maxProcess: poolInstance.getAllowProcess(),
					queueStatus: poolInstance.getActualQueueSize(),
					stats: fields,
				})
			})
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
	socket.on('task-create', (input) => {
		let json = JSON.parse(input)
		io.emit('task-create', json.taskname)
		poolInstance.insertNewTask(json)
	})

	/**
	 * Return all tasks
	 */
	socket.on('give-me-tasks', () => {
		database.connection.query('SELECT * FROM task', (err, fields) => {
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
			database.connection.query('SELECT * FROM task WHERE ID = ? AND TASKKEY = ?', params, (err, fields) => {
				if (err) {
					logger.log('error', err)
					throw err
				}
				fields = fields[0]
				delete fields.configPath
				delete fields.logPath
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

/**
 * Called before server start up
*/
const beforeStartUp = () => {
	jetpack.dir('writable')
	jetpack.dir('writable/config')
	jetpack.dir('writable/log_folder')
}

beforeStartUp()
checkDeadTasks()
