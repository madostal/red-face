const Crawler = require('local-web-crawler')
const taskParent = require('./task-parent.js')

module.exports = class CrawlerTask extends taskParent {

	constructor(serverHome, crawlerDeep, loginFormXPathExpr, loginNameXPathExpr, loginPswXPathExpr) {
		super()
		this.homeUrl = serverHome
		this.res
		this.loginFormXPathExpr = loginFormXPathExpr
		this.loginNameXPathExpr = loginNameXPathExpr
		this.loginPswXPathExpr = loginPswXPathExpr
		this._crawle(crawlerDeep)
	}

	_crawle(deep) {
		console.log(['Starting local web crawler with deep ', deep].join(''))

		const lookFor = [
			'//input',
			'//form', //form action hijacking
			this.loginFormXPathExpr,
			this.loginNameXPathExpr,
			this.loginPswXPathExpr,
		]

		const crwlIns = new Crawler(this.homeUrl, parseInt(deep), lookFor)

		crwlIns.crawle()
		this.res = crwlIns.getUrls()
		console.log(['Crawling finished with', this.res.length, 'results'].join(' '))
		console.log('Crawler results:')
		this.res.forEach(e => {
			console.log(['Url: ', e[0]].join(''))
			console.dir(e[1])
		})
		console.log()
	}

	getRes() {
		return this.res
	}
}