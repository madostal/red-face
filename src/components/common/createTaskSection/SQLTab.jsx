import React from 'react'
import {
	Header,
	Checkbox,
	Input,
	Divider,
	Grid,
	Message,
} from 'semantic-ui-react'
import { TASK_DISABLE_WARNING_MESSAGE, TASK_DISABLE_WARNING_MESSAGE_HEADER } from '../../../language/Variables'

const createStorageIfNotExist = () => {
	let json = JSON.stringify({
		'enable': false,
		data: {
			// 'testJavascriptImport': false,
			// 'testHttpHttps': false,
			// 'testGitConfig': false,
			// 'testPortScan': false,
			// // 'testPortScanData': {
			// 'testPortScanDataFrom': 1,
			// 'testPortScanDataTo': 1000,
			// // },
		},
	})
	localStorage.setItem('SQLTab', json)
	return json
}

const readStorage = () => {
	return JSON.parse(localStorage.getItem('SQLTab'))
}

export default class SQLTab extends React.Component {

	constructor(props) {
		super(props)
		let storage
		if (localStorage.getItem('SQLTab') === null) {
			storage = createStorageIfNotExist()
		}
		else {
			storage = readStorage()
		}
		let isEnable = storage.enable === true
		this.state = {
			errorHeader: TASK_DISABLE_WARNING_MESSAGE_HEADER,
			error: (!isEnable) ? TASK_DISABLE_WARNING_MESSAGE : undefined,
			setUpVisible: isEnable,
		}
	}

	_checkBoxAction = (e, d) => {
		let json = readStorage()
		if (d.checked) {
			this.setState({
				error: TASK_DISABLE_WARNING_MESSAGE,
				setUpVisible: false,
			})

			json.enable = false
		}
		else {
			this.setState({
				error: undefined,
				setUpVisible: true,
			})
			json.enable = true
		}
		localStorage.setItem('SQLTab', JSON.stringify(json))
	}

	render = () => {
		return (
			<div>
				<div>
					<Header as="h3">XSS</Header>
					<Grid >
						<Grid.Row textAlign="right">
							<Grid.Column>
								<Checkbox checked={this.state.setUpVisible} label="Enable" toggle onClick={(e, d) => this._checkBoxAction(e, d)} />
							</Grid.Column>
						</Grid.Row>
					</Grid>
					<Divider inverted />
					{this.state.error && (
						<Message info
							icon="warning circle"
							header={this.state.errorHeader}
							content={this.state.error}
						/>
					)}
					{this.state.setUpVisible ?
						<Body /> :
						null
					}
				</div>
			</div>
		)
	}
}

class Body extends React.Component {
	constructor(props) {
		super(props)

		let json = readStorage()
		this.state = {
			// testJavascriptImport: json.data.testJavascriptImport,
			// testHttpHttps: json.data.testHttpHttps,
			// testGitConfig: json.data.testGitConfig,
			// testPortScan: json.data.testPortScan,
			// testPortScanDataFrom: json.data.testPortScanDataFrom,
			// testPortScanDataTo: json.data.testPortScanDataTo,
		}
	}

	_componentOnChangeText = (d, e) => {
		this.setState({
			[e.id]: e.value,
		})
	}

	_componentOnChangeCheck = (d, e) => {
		this.setState({
			[e.id]: e.checked,
		})
	}

	componentWillUnmount = () => {
		let json = readStorage()
		json = {
			enable: json.enable,
			data: this.state,
		}
		localStorage.setItem('SQLTab', JSON.stringify(json))
	}

	render = () => {
		return (
			< div >
				//TODO SQL TAB
			</div >
		)
	}
}