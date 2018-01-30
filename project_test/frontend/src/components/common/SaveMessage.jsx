import React from 'react'
import {
	Message,
} from 'semantic-ui-react'

export default class SveMessage extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<Message
				header='Successfully saved'
				content='Your message has been successfully saved.'
			/>
		)
	}
}