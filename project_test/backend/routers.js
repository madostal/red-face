module.exports = class routers {
	setUp(router, connection) {
		router.get('/todos', (req, res) => {
			res.json([
				{
					id: 1,
					content: 'Tohle je testovaci todo cislo 1',
				},
				{
					id: 2,
					content: 'Tohle je testovaci todo cislo 2',
				}
			])
		})
	}
}