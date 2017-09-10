var async = require("async");

var taskParent = require("./TaskParent.js");
var database = require("../utils/Database.js");
var logger = require("../Logger");

module.exports = class OtherTask extends taskParent {

    constructor(taskId) {
        super(taskId);
    }

    start(coreCallback) {
        var self = this;

        database.connection.query("SELECT * FROM otherTask WHERE subTask_id = ? LIMIT 1", [this.taskId], function (err, field) {
            if (err) {
                console.error(err);
                throw err;
            }

            field = field[0];

            async.waterfall([
                function (callback) {
                    if (field.testHttpHttps === 1) {
                        self._doHttpHttps();
                    }
                    callback(null);
                },
                function (callback) {
                    if (field.testJavascriptImport === 1) {
                        self._doJavascriptImport();
                    }
                    callback(null);
                },
                function (callback) {
                    if (field.testGitConfig === 1) {
                        self._doGitConfig();
                    }
                    callback(null);
                }
            ], function (err) {
                console.log("Other task done...");
                coreCallback(null);
            });
        });
    }

    _doHttpHttps() {
        logger.log('debug', "Starting http/https test");
    }

    _doJavascriptImport() {
        logger.log('debug', "Starting javascript import test");
    }

    _doGitConfig() {
        logger.log('debug', "Starting gitocnfig test");
    }
};