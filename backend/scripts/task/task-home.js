const TaskState = Object.freeze({
	'created': 0,
	'running': 1,
	'done': 2,
	'failed': 3,
	'killed': 4,
})

module.exports = {
	TaskState,
}