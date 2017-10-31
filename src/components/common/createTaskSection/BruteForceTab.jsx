import React from 'react'
import {
	Header,
	Checkbox,
	Form,
	TextArea,
	Divider,
	Grid,
	Message,
	Input,
} from 'semantic-ui-react'

import { TASK_DISABLE_WARNING_MESSAGE, TASK_DISABLE_WARNING_MESSAGE_HEADER } from '../../../language/Variables'

const defaultXPathForm = '//form//input[@type=\'text\' or @type=\'email\']//ancestor::form//input[@type=\'password\']//ancestor::form'
const defaultXPathFormInput = ['(', [defaultXPathForm, '//input'].join(''), ')[1]'].join('')
const defaultXPathFormPsw = ['(', [defaultXPathForm, '//input'].join(''), ')[2]'].join('')

const createStorageIfNotExist = () => {
	let json = JSON.stringify({
		'enable': false,
		data: {
			'useDefaulXPath': true,
			'loginFormXPathExpr': defaultXPathForm,
			'loginNameXPathExpr': defaultXPathFormInput,
			'loginPswXPathExpr': defaultXPathFormPsw,
			'useLoginNamesDefault': true,
			'loginNames': '',
			'loginPsws': '',
			'location': '/',
			'nodes': '2',
		},
	})
	console.log("SAVING NVOY")
	localStorage.setItem('BruteForceTab', json)
	return json
}

const readStorage = () => {
	return JSON.parse(localStorage.getItem('BruteForceTab'))
}

export default class BruteForceTab extends React.Component {

	constructor(props) {
		super(props)

		let storage = null
		if (localStorage.getItem('BruteForceTab') === null) {
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
			xpathFormVisible: true,
		}
	}

	_checkBoxAction = (e, d) => {
		let json = readStorage()

		json.enable = !d.checked
		if (d.checked) {
			this.setState({
				error: TASK_DISABLE_WARNING_MESSAGE,
				setUpVisible: false,
			})
		}
		else {
			this.setState({
				error: undefined,
				setUpVisible: true,
			})
		}
		localStorage.setItem('BruteForceTab', JSON.stringify(json))
	}

	render = () => {
		return (
			<div>
				<Header as="h3">Brute Force</Header>
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
		)
	}
}
class Body extends React.Component {

	constructor(props) {
		super(props)
		let json = readStorage()
		this.state = {
			useDefaulXPath: json.data.useDefaulXPath,
			loginFormXPathExpr: json.data.loginFormXPathExpr,
			loginNameXPathExpr: json.data.loginNameXPathExpr,
			loginPswXPathExpr: json.data.loginPswXPathExpr,
			useLoginNamesDefault: json.data.useLoginNamesDefault,
			loginNames: !json.data.useLoginNamesDefault ? (Array.isArray(json.data.loginNames) ? json.data.loginNames.join('\r\n') : json.data.loginNames) : '',
			loginPsws: !json.data.useLoginNamesDefault ? (Array.isArray(json.data.loginPsws) ? json.data.loginPsws.join('\r\n') : json.data.loginPsws) : '',
			location: json.data.location,
			nodes: json.data.nodes
		}
	}

	componentWillUnmount = () => {
		let json = readStorage()
		json = {
			enable: json.enable,
			data: this.state,
		}
		localStorage.setItem('BruteForceTab', JSON.stringify(json))
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

	_switchAutomaticallyXPath = () => {
		this.setState({ useDefaulXPath: !this.state.useDefaulXPath })
		if (!this.state.useDefaulXPath) {
			this.setState({
				loginFormXPathExpr: defaultXPathForm,
				loginNameXPathExpr: defaultXPathFormInput,
				loginPswXPathExpr: defaultXPathFormPsw,
			})
		}
	}

	_switchAutomaticallyDatabase = () => {
		this.setState({ useLoginNamesDefault: !this.state.useLoginNamesDefault })
		if (!this.state.useLoginNamesDefault) {
			this.setState({
				loginNames: '',
				loginPsws: '',
			})
		}
	}

	render = () => {
		return (
			<div>
				<Form >
					<Header as="h5">Login form XPath expression</Header>
					<TextArea onChange={(d, e) => this._componentOnChangeText(d, e)} id={'loginFormXPathExpr'} value={this.state.loginFormXPathExpr} placeholder="Specify login form XPath expression" disabled={this.state.useDefaulXPath} />
				</Form>
				<Divider hidden />
				<Form >
					<Header as="h5">Input name XPath expression</Header>
					<TextArea onChange={(d, e) => this._componentOnChangeText(d, e)} id={'loginNameXPathExpr'} value={this.state.loginNameXPathExpr} placeholder="Specify input name XPath expression" disabled={this.state.useDefaulXPath} />
				</Form>
				<Divider hidden />
				<Form >
					<Header as="h5">Input password XPath expression</Header>
					<TextArea onChange={(d, e) => this._componentOnChangeText(d, e)} id={'loginPswXPathExpr'} value={this.state.loginPswXPathExpr} placeholder="Specify input password XPath expression" disabled={this.state.useDefaulXPath} />
				</Form>
				<Divider hidden />

				<Grid >
					<Grid.Row textAlign="right">
						<Grid.Column>
							<Checkbox onChange={(d, e) => this._componentOnChangeCheck(d, e)} id={'useDefaulXPath'} checked={this.state.useDefaulXPath} label={{ children: 'Automatically' }} onClick={() => this._switchAutomaticallyXPath()} />
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Grid divided="vertically">
					<Grid.Row columns={2}>
						<Grid.Column>
							<Form >
								<Header as="h5">Login names</Header>
								<TextArea onChange={(d, e) => this._componentOnChangeText(d, e)} id={'loginNames'} value={this.state.loginNames} placeholder="Login names" disabled={this.state.useLoginNamesDefault} />
							</Form>
						</Grid.Column>
						<Grid.Column>
							<Form >
								<Header as="h5">Passwords</Header>
								<TextArea onChange={(d, e) => this._componentOnChangeText(d, e)} id={'loginPsws'} value={this.state.loginPsws} placeholder="Passwords" disabled={this.state.useLoginNamesDefault} />
							</Form>
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Grid >
					<Grid.Row textAlign="right">
						<Grid.Column>
							<Checkbox onChange={(d, e) => this._componentOnChangeCheck(d, e)} id={'useLoginNamesDefault'} checked={this.state.useLoginNamesDefault} label={{ children: 'Use database' }} onClick={() => this._switchAutomaticallyDatabase()} />
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Form >
					<Header as="h5">URL location</Header>
					<Input onChange={(d, e) => this._componentOnChangeText(d, e)} id={'location'} value={this.state.location} placeholder="Specify url where is form located" fluid />
				</Form>
				<Divider hidden />
				<Form >
					<Header as="h5">Parallel nodes</Header>
					<Input onChange={(d, e) => this._componentOnChangeText(d, e)} id={'nodes'} value={this.state.nodes} placeholder="Specify how many nodes do you want use" fluid />
				</Form>
				<Divider hidden />
			</div>
		)
	}
}