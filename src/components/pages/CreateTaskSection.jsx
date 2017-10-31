import React from 'react'
import {
	Tab,
	Segment,
	Grid,
	Button,
	Header,
	Input,
	Divider,
} from 'semantic-ui-react'
import { browserHistory } from 'react-router'
import BruteForceTab from 'common/createTaskSection/BruteForceTab'
import OtherTab from 'common/createTaskSection/OtherTab'
import XSSTab from 'common/createTaskSection/XSSTab'
import SQLTab from 'common/createTaskSection/SQLTab'
import Api from 'utils/Api'

const createStorageIfNotExist = () => {
	let json = JSON.stringify({
		'taskName': '',
		'serverHome': '',
	})
	localStorage.setItem('MainTab', json)
	return json
}

const readStorage = () => {
	return JSON.parse(localStorage.getItem('MainTab'))
}

export default class CreateTaskSection extends React.Component {

	constructor(props) {
		super(props)

		let json = null
		if (localStorage.getItem('MainTab') === null) {
			json = createStorageIfNotExist()
		}
		else {
			json = readStorage()
		}
		this.state = {
			taskName: json.taskName,
			serverHome: json.serverHome,
		}
	}

	componentWillUnmount = () => {
		this._saveData()
	}

	_componentOnChangeText = (d, e) => {
		this.setState({
			[e.id]: e.value,
		})
	}

	_createTask = () => {
		this._saveData()
		browserHistory.push('/task-summary')
		let bruteForceTab = JSON.parse(localStorage.getItem('BruteForceTab'))
		if (bruteForceTab != null && bruteForceTab.enable === false) {
			bruteForceTab = null
		}

		let otherTab = JSON.parse(localStorage.getItem('OtherTab'))
		if (otherTab != null && otherTab.enable === false) {
			otherTab = null
		}

		let xssTab = JSON.parse(localStorage.getItem('XSSTab'))
		if (xssTab != null && xssTab.enable === false) {
			xssTab = null
		}

		let sqlTab = JSON.parse(localStorage.getItem('SQLTab'))
		if (sqlTab != null && sqlTab.enable === false) {
			sqlTab = null
		}

		let json = JSON.stringify({
			data: {
				'taskName': this.state.taskName,
				'serverHome': this.state.serverHome,
				'taskdata': {
					'bruteforcetab': bruteForceTab,
					'othertab': otherTab,
					'xsstab': xssTab,
					'sqltab': sqlTab,
				},
			},
		})
		Api.socketRequest('taskcreate', json)
	}

	_saveData = () => {
		let json = readStorage()
		json = this.state
		localStorage.setItem('MainTab', JSON.stringify(json))
	}

	_removeAllTasks = () => {
		localStorage.clear()
		window.location.reload()
	}

	render = () => {

		const panes = [
			{ menuItem: 'Brute force', render: () => <Tab.Pane><BruteForceTab /></Tab.Pane> },
			{ menuItem: 'XSS', render: () => <Tab.Pane ><XSSTab /></Tab.Pane> },
			{ menuItem: 'SQLTab', render: () => <Tab.Pane ><SQLTab /></Tab.Pane> },
			{ menuItem: 'Other', render: () => <Tab.Pane><OtherTab /></Tab.Pane> },
		]

		return (

			<div className="create-task-section" >
				<Tab panes={panes} />
				<Segment>
					<Header as="h3">Starter</Header>
					<Grid>
						<Grid.Row columns={2} textAlign="right">
							<Grid.Column>
								<Input id={'serverHome'} onChange={(d, e) => this._componentOnChangeText(d, e)} value={this.state.serverHome} placeholder="Server home" />
							</Grid.Column>
							<Grid.Column>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row columns={2} textAlign="right">
							<Grid.Column>
								<Input id={'taskName'} onChange={(d, e) => this._componentOnChangeText(d, e)} value={this.state.taskName} placeholder="Task name" />
							</Grid.Column>
							<Grid.Column>
								<Button onClick={() => this._createTask()} color="green">Start task</Button>
							</Grid.Column>
						</Grid.Row>
					</Grid>
					<Divider inverted />
					<Button onClick={() => this._removeAllTasks()} inverted color="red" size="tiny">Remove</Button>
				</Segment>
			</div >
		)
	}
}