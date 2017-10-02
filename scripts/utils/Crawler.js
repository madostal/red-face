var WebDriver = require('./WebDriver');

module.exports = class Crawler {

    constructor(home) {
        this.home = home;
        this.webDriver = new WebDriver();
        this.urls = new Array();
        // visited - url - writable elemets
        this.urls.push([false, home, false]);
    }

    _wasCrawled(input) {
        for (var i = 0; i < this.urls.length; i++) {
            if (this.urls[i][1] === input) {
                return true;
            }
        }
        return false;
    }

    _getUnvisited() {
        for (var i = 0; i < this.urls.length; i++) {
            if (!this.urls[i][0]) {
                this.urls[i][0] = true;
                return this.urls[i];
            }
        }
        return null;
    }

    _setHasWritable(url) {
        for (var i = 0; i < this.urls.length; i++) {
            if (this.urls[i][1] === url) {
                this.urls[i][2] = true;
            }
        }
    }

    crawle() {
        var url = this._getUnvisited();
        while (url !== null) {

            this.webDriver.goTo(url[1]);

            //check if page has some input, text area etc..
            if (this.webDriver.hasWritableElements()) {
                this._setHasWritable(url[1]);
            }

            var lastLinkst = this.webDriver.extractAllLinks();

            for (var i = 0; i < lastLinkst.length; i++) {
                var value = lastLinkst[i];
                if (!this._wasCrawled(value) && (value.startsWith(this.home) && value !== url)) {
                    this.urls.push([false, value, false]);
                }
            }

            url = this._getUnvisited();
        }

        for (var i = 0; i < this.urls.length; i++) {
            console.log(this.urls[i][1] + ", " + this.urls[i][2]);
        }

        this._shutDown();
    }

    _shutDown() {
        this.webDriver.closeDriver();
    }
};