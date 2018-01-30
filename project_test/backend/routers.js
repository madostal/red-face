module.exports = class routers {

	setUp(router, connection) {
		router.get('/todos', (req, res) => {
			connection.query('SELECT * FROM todos', (error, results) => {
				if (error) {
					res.json({ res: error })
					console.log('SQL ERROR')
					console.log(error)
					throw error
				}
				res.json(results.reverse())
			})
		})

		router.put('/store', (req, res) => {
			connection.query('INSERT INTO todos (content) VALUES (\'' + req.body.data + '\')', (error, results) => {
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
				res.json({ res: 'ok' })
			})
		})
	}
}