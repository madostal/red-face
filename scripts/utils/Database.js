var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "red-face"
});

module.exports = class Database {

    constructor() {
        connection.connect(function (err) {
            if (err) {
                console.log('Connection to db failed');
                console.log(err);
                throw err
            } else {
                console.log('Connection to database was successful');
            }
        });
    }

    getConnection() { return connection; }
}


