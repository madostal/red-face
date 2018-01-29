const define = (name, value) => {
	Object.defineProperty(exports, name, {
		value: value,
		enumerable: true,
	})
}

define('DB_MYSQL_HOST', 'localhost')
define('DB_MYSQL_USER', 'root')
define('DB_MYSQL_PSW','')
define('DB_MYSQL_DB', 'red-face-test')
define('DB_MYSQL_CHARSET', 'utf8mb4')