const LOG_FOLDER = './log_folder'
const SERVER_PORT = 4200

const fs = require('fs')
const express = require('express')
const app = express()
const server = require('http')
	.createServer(app)
const io = require('socket.io')(server)


const database = require('./utils/Database.js')
const Pool = require('./utils/pool.js')
const poolInstance = new Pool(io, LOG_FOLDER)

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
	let params = [taskHome.TaskState.failed, library.getMySQLTime(), taskHome.TaskState.done]
	database.connection.query('UPDATE task SET state = ?, endTime = ? WHERE id IN (SELECT task_id FROM subTask WHERE STATE != ?) ', params, function (err) {
		if (err) {
			logger.log('error', err)
			throw err
		}
	})

	database.connection.query('UPDATE subTask SET state = ?, endTime = ? WHERE STATE != ?', params, function (err) {
		if (err) {
			logger.log('error', err)
			throw err
		}
	})
}

io.on('connection', function (socket) {

	/**
	 * On create new task
	 */
	socket.on('taskcreate', function (input) {
		let json = JSON.parse(input)
		io.emit('taskcreate', json.data.taskname)
		poolInstance.insertNewTask(json)
	})

	/**
	 * Return all tasks
	 */
	socket.on('give-me-tasks', function (input) {
		database.connection.query('SELECT * FROM task', [], function (err, fields) {
			if (err) {
				logger.log('error', err)
				throw err
			}
			io.emit('there-are-tasks', fields)
		})
	})

	socket.on('give-me-task-detail', function (input) {
		let splitKey = input.key.split('_')
		if (splitKey.length !== 2) {
			//possible wrong key
			io.emit('there-is-task-detail', null)
		}
		else {
			let params = [splitKey[0], splitKey[1]]
			database.connection.query('SELECT * FROM TASK WHERE ID = ? AND TASKKEY = ?', params, function (err, fields) {
				if (err) {
					logger.log('error', err)
					throw err
				}
				fields = fields[0]

				io.emit('there-is-task-detail', fields)
			})
		}
	})

	socket.on('remove-task', function (input) {
		let params = [input.id]
		database.connection.query('DELETE FROM TASK WHERE ID = ?', params, function (err) {
			if (err) {
				logger.log('error', err)
				throw err
			}
		})
	})

	socket.on('repeat-task', function (input) {
		logger.log('debug', ['Repeat task id: ', input.id].join(''))
		//TODO
	})

	socket.on('stop-task', function (input) {
		logger.log('debug', ['Stop task id: ', input.id].join(''))
		poolInstance.killTask(input.id)
	})
})

serverSetUp()
checkDeadTasks()