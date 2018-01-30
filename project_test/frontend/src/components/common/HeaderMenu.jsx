import React from 'react'
import { Link } from 'react-router'
import {
	Menu,
	Segment,
} from 'semantic-ui-react'

export default class HeaderMenu extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			activeItem: 'home',
		}
	}

	_handleItemClick = (e, { name }) => this.setState({ activeItem: name })

	render = () => {
		const { activeItem } = this.state
		return (
			<Segment inverted>
				<Menu pointing secondary inverted>
					<div className="ui container">
						<Menu.Item
							name='home'
							active={(activeItem === 'home')}
							as={Link}
							to="/"
							onClick={this._handleItemClick}
						/>
						<Menu.Item
							name='list'
							active={(activeItem === 'list')}
							as={Link}
							to="/list"
							onClick={this._handleItemClick}
						/>
						<Menu.Menu position="right" >
							<Menu.Item
								name='login'
								active={(activeItem === 'login')}
								as={Link}
								to="/login"
								onClick={this._handleItemClick}
							>
								Login
							</Menu.Item>
						</Menu.Menu>
					</div>
				</Menu>
			</Segment>
		)
	}
}
