import React from 'react'
import {
	Header,
	Icon,
	Loader,
	Table,
} from 'semantic-ui-react'

export default class TableNotes extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<Table basic='very' celled collapsing size='small'>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Icon</Table.HeaderCell>
							<Table.HeaderCell>Description</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						<Table.Row>
							<Table.Cell>
								<Header as='h4' image>
									<Icon name="wait" size="large" />
								</Header>
							</Table.Cell>
							<Table.Cell>
								Task is scheduled and awaits the executor
							</Table.Cell>
						</Table.Row>

						<Table.Row>
							<Table.Cell>
								<Header as='h4' image>
									<Loader active inline size="small" />
								</Header>
							</Table.Cell>
							<Table.Cell>
								Task is in progress
							</Table.Cell>
						</Table.Row>

						<Table.Row>
							<Table.Cell>
								<Header as='h4' image>
									<Icon name="checkmark" size="large" />
								</Header>
							</Table.Cell>
							<Table.Cell>
								Task successfully completed
							</Table.Cell>
						</Table.Row>

						<Table.Row>
							<Table.Cell>
								<Header as='h4' image>
									<Icon name="exclamation triangle" size="large" />
								</Header>
							</Table.Cell>
							<Table.Cell>
								The task has failed
							</Table.Cell>
						</Table.Row>

						<Table.Row>
							<Table.Cell>
								<Header as='h4' image>
									<Icon name="crosshairs" size="large" />
								</Header>
							</Table.Cell>
							<Table.Cell>
								Task was killed when the server was restarted
							</Table.Cell>
						</Table.Row>

					</Table.Body>
				</Table >
			</div >
		)
	}
}
