import React from 'react'
import { Link } from 'react-router'
import {
	Menu,
	Segment,
	Icon,
} from 'semantic-ui-react'

export default class HeaderMenu extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			activeItem: 'home',
		}
	}

	render = () => {
		const { activeItem } = this.state
		return (
			<Segment inverted>
				<Menu pointing secondary inverted  >
					<div className="ui container">
						<Menu.Item name='Home' active={(activeItem === 'home')} as={Link} to="/" />
						<Menu.Item name='List' active={(activeItem === 'list')} as={Link} to="/list" />
						<Menu.Menu position="right" >
							<Menu.Item name='login' active={(activeItem === 'login')} as={Link} to="/login">
								Login
							</Menu.Item>
						</Menu.Menu>
					</div>
				</Menu>
			</Segment>
		)
	}
}
