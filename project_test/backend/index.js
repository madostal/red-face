const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')

const settings = require('./settings')

const connection = mysql.createConnection({
	host: settings.DB_MYSQL_HOST,
	user: settings.DB_MYSQL_USER,
	password: settings.DB_MYSQL_PSW,
	database: settings.DB_MYSQL_DB,
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(require('cors')())

const port = process.env.PORT || 8080
const router = express.Router()

//set up api endpoits
new (require('./routers'))().setUp(router, connection)

app.use('/api', router)
app.listen(port)

console.log(['Server start up on', port].join(' '))