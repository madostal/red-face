import React from 'react'
import { Link } from 'react-router'
import {
	Menu,
	Button,
	Segment,
	Popup,
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
			<div>
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
									name='register'
									active={(activeItem === 'register')}
									as={Link}
									to="/register"
									onClick={this._handleItemClick}
								>
									Register
							</Menu.Item>
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
			</div>
		)
	}
}
