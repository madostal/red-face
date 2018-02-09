import React from 'react'
import {
	Message,
} from 'semantic-ui-react'

export default class DisableTaskMessage extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<Message info
					icon="warning circle"
					header='Info message'
					content='This task is disabled and will not be executed'
				/>
			</div>
		)
	}
}