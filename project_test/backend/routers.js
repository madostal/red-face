const passwordHash = require('password-hash')
const async = require('async')

module.exports = class routers {

	setUp(router, connection) {
		router.get('/todos', (req, res) => {
			connection.query('SELECT * FROM todos ORDER BY id DESC', (error, results) => {
				if (error) {
					res.json({ res: error })
					console.log('SQL ERROR')
					console.log(error)
					throw error
				}
				res.json(results)
			})
		})

		router.put('/store', (req, res) => {
			console.log(req.body)
			connection.query('INSERT INTO todos (content, user) VALUES (\'' + req.body.data + '\', \'' + req.body.user + '\')', (error, results) => {
				if (error) {
					res.json({ res: error })
					console.log('SQL ERROR')
					console.log(error)
					throw error
				}
				res.json({ res: results })
			})
		})

		router.delete('/delete/', (req, res) => {
			connection.query('DELETE FROM todos WHERE id = \'' + req.body.id + '\'', (error) => {
				if (error) {
					res.json({ res: error })
					console.log('SQL ERROR')
					console.log(error)
					throw error
				}
				this._sendSucc(res)
			})
		})

		router.post('/create-user', (req, res) => {
			if (!req.body.login || req.body.login.length <= 3) {
				this._sendFail(res, 'The login must be longer than 3 characters')
				return
			}
			if (!req.body.psw || !req.body.psw2 || req.body.psw !== req.body.psw2) {
				this._sendFail(res, 'Password didn\'t match or are empty')
				return
			}

			async.waterfall([
				(callback) => {
					connection.query('SELECT * FROM user WHERE login = ?', [req.body.login], (error, results) => {
						if (error) {
							res.json({ res: error })
							console.log('SQL ERROR')
							console.log(error)
							throw error
						}
						//user doesnt exist
						callback(null, results.length === 0)
					})
				}
			], (err, result) => {
				if (!result) {
					this._sendFail(res, 'User with this name already exist')
				} else {
					connection.query('INSERT INTO user (login, psw) VALUES (?, ?)', [req.body.login, passwordHash.generate(req.body.psw)], (error) => {
						if (error) {
							res.json({ res: error })
							console.log('SQL ERROR')
							console.log(error)
							throw error
						}
						this._sendSucc(res)
					})
				}
			})
		})

		router.post('/login-user', (req, res) => {
			if (!req.body.login || !req.body.psw) {
				this._sendFail(res, 'Login failed')
				return
			}
			connection.query('SELECT * FROM user WHERE login = ? limit 1', [req.body.login], (error, results) => {
				if (error) {
					res.json({ res: error })
					console.log('SQL ERROR')
					console.log(error)
					throw error
				}
				if (results.length === 0) {
					this._sendFail(res, 'Login failed')
					return
				}
				if (passwordHash.verify(req.body.psw, results[0].psw)) {
					this._sendSucc(res)
				} else {
					this._sendFail(res, 'Login failed')
				}
			})
		})

		router.get('/detail/:id', (req, res) => {
			if (!req.params.id) {
				this._sendFail(res, 'Id is empty')
				return
			}
			connection.query('SELECT * FROM todos WHERE id = ? limit 1', [req.params.id], (error, results) => {
				if (error) {
					res.json({ res: error })
					console.log('SQL ERROR')
					console.log(error)
					throw error
				}
				if (results.length === 0) {
					this._sendFail(res, 'No data for this id')
					return
				}
				res.json(results[0])
			})
		})
	}

	_sendFail(res, msg) {
		res.json({
			res: 'fail',
			msg: msg,
		})
	}

	_sendSucc(res) {
		res.json({ res: 'ok' })
	}
}