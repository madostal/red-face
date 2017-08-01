var args = process.argv.slice(2);
var id = args[0];
 
console.log("Program args: " + id);

loop = Math.floor(Math.random() * (60 - 15 + 1)) + 15;
console.log("Task id: " + id + " started: " + loop + "ms");

for (i = 0; i < loop; i++) {
    ms = 1000;
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

console.log("Task id: " + id + " closed");
