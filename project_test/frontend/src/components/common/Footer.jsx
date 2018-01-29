import React from 'react'
import {
	Sidebar,
	Menu,
	Icon,
} from 'semantic-ui-react'

export default class Footer extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<Menu fixed='bottom' size='mini' inverted>
					<div id='footer-text'>
						RedFace TEST PROJECT
					</div>
				</Menu>
			</div>
		)
	}
}
