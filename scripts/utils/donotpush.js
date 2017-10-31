// const Crawler = require('./Crawler')
// var home = 'http://oks.kiv.zcu.cz'

// let crawler = new Crawler(home)
// crawler.crawle()
// let output = crawler.getUrls()

// console.log(output)

// let filtered = output.filter((item) => {
// 	return item[1];
// })

// console.log(filtered)

const XSSandSQLIn = require('../attack/XSSandSQLIn')

// let filtered = [
// 	['file:///C:/Users/PanTau_acc/Desktop/neco.html', true],
// 	['http://oks.kiv.zcu.cz/Prevodnik/Prevodnik', true],
// 	['http://oks.kiv.zcu.cz/Forum/Registrace', true],
// 	['http://oks.kiv.zcu.cz/OsobniCislo/Generovani', true]
// ]

// let xssAndSqlIn = new XSSandSQLIn([true, false], filtered);
// xssAndSqlIn.start()

const Crawler = require('local-web-crawler')

const lookFor = ['//input[@type=\'text\']', '//input[@type=\'password\']', '//textarea']
const homePage = 'http://oks.kiv.zcu.cz'

const crwlIns = new Crawler(homePage, -1, lookFor)

crwlIns.crawle()

let crawlerOut = crwlIns.getUrls()

let filtered = [];
for (let i = 0; i < crawlerOut.length; i++) {
	let tmp = crawlerOut[i]
	if (tmp[1].inputtypetext || tmp[1].inputtypepassword || tmp[1].textarea) {
		filtered.push(tmp[0])
	}
}


let xssAndSqlIn = new XSSandSQLIn([true, false], filtered);
xssAndSqlIn.start()