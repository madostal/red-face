const jetpack = require("fs-jetpack");
var stringSimilarity = require("string-similarity");

var database = require("../utils/Database.js");
var taskParent = require("./TaskParent.js");
var WebDriver = require("../utils/WebDriver");
var library = require("../utils/Library");

module.exports = class BruteForceTask extends taskParent {

	constructor(taskId, serverHome) {
		super(taskId);
		this.serverHome = serverHome;
	}

	start(coreCallback) {
		var self = this;
		console.log(this.taskId);
		database.connection.query("SELECT * FROM bruteforceTask WHERE subTask_id = ? LIMIT 1", [this.taskId], function (err, field) {
			if (err) {
				console.error(err);
				throw err;
			}
			field = field[0];

			self.serverHome = self._createUri(self.serverHome, field.urlLocation);

			webDriver = new WebDriver();

			console.log("Starting BruteForceTask");
			console.log(["Location of login form is: ", field.loginFormXPathExpr].join(""));
			console.log(["Location of login name input is: ", field.loginNameXPathExpr].join(""));
			console.log(["Location of login password input is: ", field.loginpswXPathExpr].join(""));

			webDriver.goTo(self.serverHome, 0);
			webDriver.doLogin("red-face", "-1", field.loginFormXPathExpr, field.loginNameXPathExpr, field.loginpswXPathExpr, 0);
			var errorPage = webDriver.getDocumentText(0);

			var data = self._parseInputData(jetpack.read(field.testFilePath));
			data = self._createCombos(data[0], data[1]);
			console.log(["There are ", data.length, " combination for test"].join(""));

			var startTime = new Date();
			var count = 0;
			for (var i = 0; i < data.length; i++) {
				count++;
				console.log(["Testing", data[i][0], data[i][1]].join(" "));

				webDriver.goTo(self.serverHome, 0);
				webDriver.doLogin(data[i][0], data[i][1], field.loginFormXPathExpr, field.loginNameXPathExpr, field.loginpswXPathExpr, 0);

				var tmp = webDriver.getDocumentText(0);
				var similarity = stringSimilarity.compareTwoStrings(errorPage, tmp);

				if ((similarity * 100) < 1) {
					console.log("Probably found credentials");
					console.log([data[i][0], data[i][1]].join(" "));
					break;
				}
			}

			console.log(["Avarage:", ((new Date() - startTime) / count), "ms peer test"].join(" "));
			console.log(["It took", library.timeDiffNow(startTime), count, "accout-password tested"].join(" "));

			webDriver.closeDriver();
			coreCallback(null);
		});
	}

	/**
	 * Create uri -> example.com + where is login form located
	 * example.com + / + login -> example.com/login
	 *
	 * @param {String} uri
	 */
	_createUri(serverHome, uri) {
		if (serverHome.endsWith("/") && uri.startsWith("/")) {
			return [serverHome, uri.substr(1)].join("");
		}

		if (!serverHome.endsWith("/") && !uri.startsWith("/")) {
			return [serverHome, "/", uri].join("");
		}

		return [serverHome, uri].join("");
	}

	/**
	 * Parse input text loaded from file to array of [login, psw]
	 * 
	 * @param {String[String[]]} data 
	 */
	_parseInputData(data) {
		var arr1 = []; var arr2 = []; var tmp = arr1;

		for (var loop of data.split("\r\n")) {
			if (loop.length === 0) {
				tmp = arr2;
				continue;
			}
			tmp.push(loop);
		}

		return [arr1, arr2];
	}

	/**
	 * Create all combinations of two arrays
	 * 
	 * @param {String[]} array1 
	 * @param {String[]} array2 
	 */
	_createCombos(array1, array2) {
		var combos = [];

		for (var i = 0; i < array1.length; i++) {
			for (var j = 0; j < array2.length; j++) {
				combos.push([array1[i], array2[j]]);
			}
		}
		return combos;
	}
};