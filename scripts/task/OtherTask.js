var async = require("async");
var scan = require("net-scan");
var portNumbers = require("port-numbers");
var puppeteer = require('puppeteer');

var taskParent = require("./TaskParent.js");
var database = require("../utils/Database.js");
var logger = require("../Logger");

module.exports = class OtherTask extends taskParent {

    constructor(taskId, serverHome) {
        super(taskId);
        this.serverHome = serverHome;
    }

    start(coreCallback) {
        var self = this;

        database.connection.query("SELECT * FROM otherTask WHERE subTask_id = ? LIMIT 1", [this.taskId], function (err, field) {
            if (err) {
                console.error(err);
                throw err;
            }

            field = field[0];
            console.log("------------------------------");
            console.log(field);
            async.waterfall([
                function (callback) {
                    if (field.testHttpHttps === 1) {
                        self._doHttpHttps(callback);
                    } else {
                        callback(null);
                    }
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
                },
                function (callback) {
                    if (field.testPortScan === 1) {
                        database.connection.query("SELECT * FROM portScan WHERE otherTask_id = ? LIMIT 1", [field.id], function (err, field) {
                            if (err) {
                                console.error(err);
                                throw err;
                            }
                            console.log(field);
                            self._doPortScan(field[0], self.serverHome, callback);
                        });
                    } else {
                        callback(null);
                    }
                }
            ], function (err) {
                console.log("Other task done...");
                coreCallback(null);
            });
        });
    }

    _doHttpHttps(callback) {
        logger.log("debug", "Starting http/https test");
        console.log(["Checking ", this.serverHome, " server protocol"].join(""));
        var url = this.serverHome;
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);

            var protocol = await page.evaluate(() => {
                return location.protocol
            });

            console.log(["Server ", this.serverHome, " using ", protocol.replace(":", ""), " protocol"].join(""));
            browser.close();
            callback(null);
        })();
    }

    _doJavascriptImport() {
        logger.log("debug", "Starting javascript import test");
    }

    _doGitConfig() {
        logger.log("debug", "Starting gitconfig test");
    }

    _doPortScan(field, serverHome, callback) {
        logger.log("debug", "Starting portscan test");

        console.log(["Starting port scan on range: ", field.from, " - ", field.to, " on ", serverHome].join(""));
        console.time("ports scan");
        scan.port({
            host: serverHome.replace(/(^\w+:|^)\/\//, ''), //remove https:// or https// from actual url
            start: field.from,
            end: field.to,
            timeout: 10000,
            queue: 1000
        })
            .on("open", function (port) {
                var portString = portNumbers.getService(port);
                if (portString === null) {
                    console.log(port);
                }
                else {
                    console.log([portString.name, " on ", port, " - (", portString.description, ")"].join(""));
                }
            })
            .on("end", function (port) {
                callback(null);
            });
    }
};