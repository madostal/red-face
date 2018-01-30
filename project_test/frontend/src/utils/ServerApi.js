const superagent = require('superagent')

const PROD_HOSTNAME = 'localhost'
const PORT = '8080'

const getApiDomain = () => {
	let hostname = document.location.hostname
	if (hostname.match(/localhost$/)) {
		return ['localhost', ':', PORT].join('')
	} else {
		return [PROD_HOSTNAME, ':', PORT].join('')
	}
}

class Api {

	constructor() {
		this.baseUrl = ['http://', getApiDomain(), '/'].join('')
	}

	sendPost(path, params, cb) {
		let req = superagent('POST', this.baseUrl + path)
		req.send(params)
		req.end((error, res) => {
			cb(error, (error ? {} : JSON.parse(res.text)))
		})
		return req
	}

	sendGet(path, cb) {
		let req = superagent('GET', this.baseUrl + path)
		req.send()
		req.end((error, res) => {
			cb(error, (error ? {} : JSON.parse(res.text)))
		})
		return req
	}

	sendPut(path, params, cb) {
		let req = superagent('PUT', this.baseUrl + path)
		req.send(params)
		req.end((error, res) => {
			cb(error, (error ? {} : JSON.parse(res.text)))
		})
		return req
	}

	sendDelete(path, params, cb) {
		let req = superagent('DELETE', this.baseUrl + path)
		req.send(params)
		req.end((error, res) => {
			cb(error, (error ? {} : JSON.parse(res.text)))
		})
		return req
	}
}

export default new Api()