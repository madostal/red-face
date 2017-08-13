
var TaskState = Object.freeze({
    "created": 0,
    "running": 1,
    "done": 2,
    "failed": 3
});

var TaskType = Object.freeze({
    'bruteForce': 0
});

module.exports =
    {
        TaskState,
        TaskType
    };