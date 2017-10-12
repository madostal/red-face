const stringSimilarity = require('string-similarity');
const Crawler = require('./Crawler');
const webDriver = require('../utils/WebDriver');
// var home = 'http://oks.kiv.zcu.cz';
// var home = 'http://localhost';
// home = 'http://localhost:3000';

const webDriver = new webDriver();

const startTime = new Date();
function myCosine(t1, t2) {
    var s = stringSimilarity.compareTwoStrings(t1, t2);

    console.log(s);
}
webDriver.goTo("https://badoo.com/signin/?f=top", 0);
webDriver.doLogin("q", "q", "//form//input[@type='text' or @type='email']//ancestor::form//input[@type='password']//ancestor::form");
var failText = webDriver.getDocumentText();
for (var i = 0; i < 100; i++) {

    webDriver.goBack(0);

    webDriver.doLogin("a", "b", "//form//input[@type='text' or @type='email']//ancestor::form//input[@type='password']//ancestor::form", 0);

    var newText = webDriver.getDocumentText(0);
   
    myCosine(failText, newText);


}
 

// later record end time
var endTime = new Date();

// time difference in ms
var timeDiff = endTime - startTime;

// strip the ms
timeDiff /= 1000;

// get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
var seconds = Math.round(timeDiff % 60);
console.log(seconds + "s");

// instance.crawle();

// var stack = new Array();

// var home = 'http://oks.kiv.zcu.cz';



// function

// // instance.goTo(home); 
// stack.push([false, home]);  
// var url = getUnvisited();
// while (url !== null) {

//     console.log("Go to url: " + url[1]);
//     instance.goTo(url[1]);
//     var lastLinkst = instance.extractAllLinks();

//     lastLinkst.forEach(function (value) {    
//         if (!this._contains(value) && (value.startsWith(home) && value !== url)) {            
//                 stack.push([false, value]);           
//         }
//     });

//     url = getUnvisited();
// }

// console.log("FOUND URLS:");
// for (var i = 0; i < stack.length; i++) {
//     console.log(stack[i][1]);
// }


// instance.closeDriver();

// var cosine = require('cosine')


// var x = "úpěl ďábelské ódy příliš žluťoučký kůň".split(/\s/)
// var y = "příliš žluťoučký kůň úpěl ďábelské ódy".split(/\s/)

// var s = cosine( x, y );

// console.log(s);