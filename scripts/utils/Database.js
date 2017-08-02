var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dp"
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

    executeNonSelectSql(sql, values, callback) {
        connection.query(sql, values, function (err, result) {
            if (err) throw err;
            if (callback) callback(result.insertId);
        });
    };

    executeSelectSql(sql, callback, response) {
        connection.query("SELECT * FROM task", function (err, result, fields) {
            if (err) throw err;
            if (callback) callback(response, result, fields);
        });
    }
}


