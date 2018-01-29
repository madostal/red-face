import React from 'react'
import {
	Table,
	Grid,
	Segment,
	Button,
	Header,
	Menu,
	Icon,
	Divider,
	Statistic,
	Input,
} from 'semantic-ui-react'

export default class ListPage extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			inputVal: '',
		}
	}

	_handleInputChange = (e, { value }) => {
		this.setState({
			inputVal: value,
		})
	}

	_createDangerPart = (val) => {
		return { __html: val }
	}

	render = () => {
		const { inputVal } = this.state
		return (
			<div>
				<Header as='h1'>TODO list</Header>
				<Divider hidden />
				<Input
					placeholder='Insert your text...'
					fluid
					onChange={this._handleInputChange}
				/>
				<Divider />
				<div dangerouslySetInnerHTML={this._createDangerPart(inputVal)} />

			</div>
		)
	}
}