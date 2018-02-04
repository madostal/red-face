import React from 'react'
import {
	Button,
	Segment,
	Popup,
} from 'semantic-ui-react'
import CookieWorker from 'utils/CookieWorker'

export default class HeaderUser extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			actualUser: CookieWorker.getCookie('username') || 'No one is logged in',
		}
	}

	_handleUserClick = () => {
		CookieWorker.eraseCookie('username')
		this.setState({
			actualUser: CookieWorker.getCookie('username') || 'No one is logged in',
		})
	}

	render = () => {
		const { actualUser } = this.state
		return (
			<Segment
				inverted
				size='mini'
				textAlign='right'
				onClick={this._handleUserClick}
			>
				<Popup
					trigger={
						<Button inverted>
							{actualUser}
						</Button>
					}
					content='Click for logout'
				/>
			</Segment>
		)
	}
}
