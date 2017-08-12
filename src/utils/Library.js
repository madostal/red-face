var mySQLDateToHumanReadable = function (mysqlDateTimeStamp) {
    var date = new Date(mysqlDateTimeStamp);

    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec + " " + day + "." + month + "." + date.getFullYear();
}

module.exports = {
	mySQLDateToHumanReadable
}