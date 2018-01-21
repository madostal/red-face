import React from 'react'
import {
	Button,
	Message,
	Icon,
} from 'semantic-ui-react'
import { Link } from 'react-router'

export default class TaskSummaryPage extends React.Component {

	render = () => {
		return (
			<Message icon info>
				<Icon name='check' />
				<Message.Content>
					<Message.Header>Successfully created</Message.Header>
					<p>
						Your task was created and will be planned in few minutes
						<Button icon size='mini' floated='right' primary as={Link} to="/create-task">
							Create task
						</Button>
						<Button icon size='mini' floated='right' primary as={Link} to="/overview" >
							Overview
						</Button>
					</p>
				</Message.Content>
			</Message>
		)
	}
}