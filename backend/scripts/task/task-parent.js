module.exports = class ParentTask {

	constructor(jsonconfig, name) {
		this.jsonconfig = jsonconfig
		this.taskRes = {
			header: name,
			data: [],
		}
	}

	_parseUrl(url) {
		return url.split(' ').join('%20')
	}
}
