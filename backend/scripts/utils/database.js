const mysql = require('mysql')

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'red-face',
	// debug: true,
})

connection.connect(err => {
	if (err) {
		console.error(err)
		throw err
	}
	else {
		console.log('Connection to database was successful')
	}
})

module.exports = {
	connection,
}