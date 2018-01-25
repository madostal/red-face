import React from 'react'
import PropTypes from 'prop-types'
import {
	Button,
} from 'semantic-ui-react'

export default class TableFilter extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			active: [true, true, true, true, true],
		}
	}

	_handleClick = (e, { id }) => {
		this.props.clickCb(id)
		let arr = this.state.active
		arr[id] = !arr[id]
		this.setState({
			active: arr,
		})
	}

	_getBtnFrame = (isActive) => {
		return isActive ? 'green' : 'red'
	}

	render = () => {
		let c0 = this._getBtnFrame(this.state.active[0])
		let c1 = this._getBtnFrame(this.state.active[1])
		let c2 = this._getBtnFrame(this.state.active[2])
		let c3 = this._getBtnFrame(this.state.active[3])
		let c4 = this._getBtnFrame(this.state.active[4])

		return (
			<div>
				<Button.Group size='small'>
					<Button as='a' icon='wait' basic color={c0} id={0} onClick={this._handleClick} />
					<Button as='a' loading icon='home' basic color={c1} id={1} onClick={this._handleClick} />
					<Button icon='checkmark' basic color={c2} id={2} onClick={this._handleClick} />
					<Button icon='exclamation triangle' basic color={c3} id={3} onClick={this._handleClick} />
					<Button icon='crosshairs' basic color={c4} id={4} onClick={this._handleClick} />
				</Button.Group>
			</div>
		)
	}
}

TableFilter.propTypes = {
	clickCb: PropTypes.func.isRequired,
}