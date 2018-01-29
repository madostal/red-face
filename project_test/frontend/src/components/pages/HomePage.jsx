import React from 'react'
import {
	Table,
	Grid,
	Segment,
	Button,
	Header,
	Menu,
	Icon,
	Divider,
	Statistic,
	Input,
} from 'semantic-ui-react'

export default class HomePage extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<Header as='h2' icon textAlign='center'>
					<Icon name='bug' circular />
					<Header.Content>
						RedFace TEST server
					</Header.Content>
				</Header>
				<Divider />
				<p>This app is test server for RedFace pproject</p>
				<p>Application contains some error which is detectable by RedFace app</p>
				<Divider hidden />
				<p>A simple todo app in which you can create your own notes ("TODO")</p>
				<p>"TODO" notes can be added by both the registered user and the unregistered user</p>
			</div>
		)
	}
}