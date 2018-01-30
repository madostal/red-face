import React from 'react'
import {
	Table,
	Grid,
	List,
	Segment,
	Button,
	Header,
	Menu,
	Form,
	Icon,
	Divider,
	Statistic,
	Input,
} from 'semantic-ui-react'
import SaveMessage from './../common/SaveMessage'
import ServerApi from 'utils/ServerApi'

export default class ListPage extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			inputVal: '',
			saveMessageVisible: false,
			data: [],
		}
	}

	componentDidMount = () => {
		this._updateList()
	}

	_handleInputChange = (e, { value }) => {
		this.setState({
			inputVal: value,
		})
	}

	_updateList = () => {
		ServerApi.sendGet('api/todos', (error, respData) => {
			if (error) { console.log(error) }
			this.setState({
				data: respData,
			})
		})
	}

	_handleSave = () => {
		if (this.state.inputVal.length === 0) return

		ServerApi.sendPut('api/store', { data: this.state.inputVal }, (error) => {
			if (error) { console.log(error) }
			this._updateList()
			this.setState({
				inputVal: '',
				saveMessageVisible: true,
			})
			setTimeout(() => this.setState({ saveMessageVisible: false }), 5000)
		})
	}

	_handleListClick = (e, { name }) => {
		console.log('Clickend: ' + name)
		let tmp = this.state.data
		let n = []

		ServerApi.sendDelete('api/delete', { id: name }, (error) => {
			if (error) { console.log(error) }
			for (let i = 0; i < tmp.length; i++) {
				if (tmp[i].id !== name) {
					n.push(tmp[i])
				}
			}
			this.setState({
				data: n,
			})
		})
	}

	_createDangerPart = (val) => {
		return { __html: val }
	}

	render = () => {
		const { inputVal, saveMessageVisible, data } = this.state

		let list = []
		data.forEach(e => {
			list.push(
				<List.Item
					key={e.id}
					name={e.id}
					as='a'
					onClick={this._handleListClick}
				>
					<Icon name='right triangle' />
					<List.Content>
						<List.Header>{e.content}</List.Header>
					</List.Content>
				</List.Item>
			)
		})

		return (
			<div>
				<Header as='h1'>TODO list</Header>
				<Divider hidden />
				<Form>
					<Input
						placeholder='Insert your text...'
						fluid
						onChange={this._handleInputChange}
						value={inputVal}
					>
						<input />
						<Button
							content='Save'
							onClick={this._handleSave}
						/>
					</Input>
					{saveMessageVisible ? <SaveMessage /> : ''}
				</Form>
				<Divider />
				<Header as='h5'>Preview</Header>
				<div dangerouslySetInnerHTML={this._createDangerPart(inputVal)} />
				<Divider />
				<Header as='h5'>Todos</Header>
				<List>
					{list}
				</List>
			</div>
		)
	}
}