import React from 'react'
import { Link } from 'react-router'
import {
	Menu,
	Icon,
} from 'semantic-ui-react'

export default class HeaderMenu extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			activeItem: 'home'
		}
	}

	_handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
	}

	render = () => {
		const { activeItem } = this.state
		return (
			<Menu fixed="top" inverted>
				<div className="ui container">
					<Menu.Item name='overview' active={(activeItem === 'overview')} as={Link} to="/overview">
						<Icon name="list" /> Overview
						</Menu.Item>
					<Menu.Menu position="right" >
						<Menu.Item name='createtask' active={(activeItem === 'createtask')} as={Link} to="/create-task">
							<Icon name="plus" /> Create task
						</Menu.Item>
					</Menu.Menu>
				</div>
			</Menu>
		)
	}
}