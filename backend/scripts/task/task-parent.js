module.exports = class ParentTask {

	constructor(jsonconfig, name) {
		this.jsonconfig = jsonconfig
		this.taskRes = {
			header: name,
			data: [],
		}

		/**
			data: {
				header: HEADER,
				data: [
					{
						text : string,
						vulnerability: {0 - true, 1 - false, 2 - default}
					}
				],
			}
		*/
	}
}
