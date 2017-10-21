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

let filtered = [
	['file:///C:/Users/jakub.loffelmann/Desktop/neco.html', true],
	['http://oks.kiv.zcu.cz/Prevodnik/Prevodnik', true],
	['http://oks.kiv.zcu.cz/Forum/Registrace', true],
	['http://oks.kiv.zcu.cz/OsobniCislo/Generovani', true]
]

let xssAndSqlIn = new XSSandSQLIn([true, false], filtered);
xssAndSqlIn.start()