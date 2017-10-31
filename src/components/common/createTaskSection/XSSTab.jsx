import React from 'react'
import {
	Header,
	Checkbox,
	Form,
	TextArea,
	Divider,
	Grid,
	Message,
} from 'semantic-ui-react'
import { TASK_DISABLE_WARNING_MESSAGE, TASK_DISABLE_WARNING_MESSAGE_HEADER } from '../../../language/Variables'

const DEFAULT_XSS = [
	'\'\">><marquee><img src=x onerror=confirm(1)></marquee>\"></plaintext\></|\><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>\'-->\"></script><script>alert(document.cookie)</script>\"><img/id=\"confirm&lpar;1)\"/alt=\"/\"src=\"/\"onerror=eval(id)>\'\"><img src=\"http://www.shellypalmer.com/wp-content/images/2015/07/hacked-compressor.jpg\">',
	'second',
]

const createStorageIfNotExist = () => {
	let json = JSON.stringify({
		'enable': false,
		data: {
			'useDefault': !false,
			'userSettings': DEFAULT_XSS,
		},
	})
	localStorage.setItem('XSSTab', json)
	return json
}

const readStorage = () => {
	return JSON.parse(localStorage.getItem('XSSTab'))
}

export default class XSSTab extends React.Component {

	constructor(props) {
		super(props)
		let storage
		if (localStorage.getItem('XSSTab') === null) {
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
		localStorage.setItem('XSSTab', JSON.stringify(json))
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
			'useDefault': json.data.useDefault,
			'userSettings': json.data.userSettings,
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
		localStorage.setItem('XSSTab', JSON.stringify(json))
	}

	_switch = () => {
		// this.setState({ userSettings: !this.state.useDefaulXPath })
		if (!this.state.useDefault) {
			this.setState({
				'userSettings': DEFAULT_XSS.join('\r\n'),
			})
		}
	}

	render = () => {
		return (
			< div >
				<Form >
					<Header as="h5">Input XSS attack (is checked by alert)</Header>
					<TextArea onChange={(d, e) => this._componentOnChangeText(d, e)} id={'userSettings'} value={this.state.userSettings} placeholder="Specify input password XPath expression" disabled={this.state.useDefault} />
				</Form>
				<Divider hidden />

				<Grid >
					<Grid.Row textAlign="right">
						<Grid.Column>
							<Checkbox onChange={(d, e) => this._componentOnChangeCheck(d, e)} id={'useDefault'} checked={this.state.useDefault} label={{ children: 'Use database' }} onClick={() => this._switch()} />
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Form />
			</div >
		)
	}
}