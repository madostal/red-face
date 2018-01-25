import React from 'react'
import CpuGraph from './../common/graph/CpuGraph'
import TaskStatusRepresentation from './../common/graph/TaskStatusRepresentation'
import {
	Table,
	Grid,
	Segment,
	Button,
	Header,
	Icon,
	Divider,
	Input,
} from 'semantic-ui-react'
import Helper from '../common/popup/Helper'
import CustomAccordion from '../common/CustomAccordion'
import Api from 'utils/Api'

export default class DashboardPage extends React.Component {

	constructor(props) {
		super(props)

		//flag if settings was loaded first time
		this.wasLoaded = false

		this.state = {
			cpupercentage: NaN,
			activeTasks: NaN,
			actualActiveTasks: NaN,
			maxActiveTasks: NaN,
			maxActiveTaskEdited: NaN,
			queueStatus: NaN,
			data: [],
			cpuusage: !true,
			taskstate: this._makeRepresentationData([])
		}

		Api.getSocket().on('system-stats', (d) => {
			this.setState({
				cpupercentage: d.cpu.toFixed(0),
				data: this._processBuffer(d.cpu),
				actualActiveTasks: d.activeProcess,
				maxActiveTasks: d.maxProcess,
				queueStatus: d.queueStatus,
				maxActiveTasksEdited: (!this.wasLoaded ? d.maxProcess : this.state.maxActiveTasksEdited),
				taskstate: this._makeRepresentationData(d.stats),
			})

			this.wasLoaded = true
		})
		Api.socketRequest('get-system-stats', {})
	}

	_makeRepresentationData = (data) => {
		let o = [
			{ name: 'Planed', number: 0 },
			{ name: 'In progress', number: 0 },
			{ name: 'Successful', number: 0 },
			{ name: 'Failed', number: 0 },
			{ name: 'Killed', number: 0 },
		]
		data.forEach(e => {
			o[e.state].number = e.count
		})
		return o
	}
	componentDidMount = () => {
		this.interval = setInterval(() => Api.socketRequest('get-system-stats', {}), 1000)
	}

	componentWillUnmount = () => {
		clearInterval(this.interval)
		Api.getSocket().removeAllListeners('get-system-stats')
	}

	_processBuffer = (val) => {
		let MAX = 20
		let last = this.state.data
		let out = []

		if (last.length < MAX) {
			let iterator = 1
			last.forEach(e => out.push({ cpu: e.cpu, name: last.length + 1 - iterator++ }))
		} else {
			for (let i = last.length - MAX; i < last.length; i++) {
				out.push({
					name: MAX - i + 1,
					cpu: last[i].cpu,
				})
			}
		}

		out.push({
			name: 0,
			cpu: val.toFixed(0),
		})

		return out
	}

	componentWillUnmount = () => {
		Api.getSocket().removeAllListeners('system-stats')
	}

	_maxActiveTasksChanged = (e, d) => {
		let n = d.value
		let num = parseInt(n)
		if (Number.isInteger(num)) {
			if (num > 0 && num < 100) {
				this.setState({ maxActiveTasksEdited: num })
			} else {
				this.setState({ maxActiveTasksEdited: 2 })
			}
		} else {
			this.setState({ maxActiveTasksEdited: 2 })
		}
	}

	_saveMaxActiveTasks = () => {
		if (this.state.maxActiveTasks === this.state.maxActiveTasksEdited) {
			return
		}
		Api.socketRequest('set-system-settings', { maxActiveTasks: this.state.maxActiveTasksEdited })
		this.setState({
			maxActiveTasks: this.state.maxActiveTasksEdited,
		})
	}

	render = () => {
		return (
			<div>
				<Segment>
					<CustomAccordion
						header={
							<Header as='h3'>
								<Icon name='configure' />
								<Header.Content>
									| System overview
							</Header.Content>
							</Header>
						}
						content={
							<Table basic='very' collapsing>

								<Table.Body>
									<Table.Row>
										<Table.Cell>
											<Header as='h4' >
												<Header.Content>
													CPU usage
								</Header.Content>
											</Header>
										</Table.Cell>
										<Table.Cell>
											{this.state.cpupercentage}%
						</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>
											<Header as='h4' >
												<Header.Content>
													Actual active tasks
								</Header.Content>
												<Header.Subheader>
													<Helper
														header='Actual active tasks'
														content='Specifies how many tasks are currently in progress'
													/>
												</Header.Subheader>
											</Header>
										</Table.Cell>
										<Table.Cell>
											{this.state.actualActiveTasks}/{this.state.maxActiveTasks}
										</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>
											<Header as='h4' >
												<Header.Content>
													Queue status
											</Header.Content>
												<Header.Subheader>
													<Helper
														header='Queue status'
														content='Specifies how many tasks are waiting for the startup in queue'
													/>
												</Header.Subheader>
											</Header>
										</Table.Cell>
										<Table.Cell>
											{this.state.queueStatus}
										</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>
											<Header as='h4' >
												<Header.Content>
													Max active tasks
												</Header.Content>
												<Header.Subheader>
													<Helper
														header='Max active tasks'
														content='Specifies how many tasks can run parallel'
													/>
												</Header.Subheader>
											</Header>
										</Table.Cell>
										<Table.Cell>
											<Input action={
												<Button
													icon='save'
													onClick={this._saveMaxActiveTasks}
													active={this.state.maxActiveTasks === this.state.maxActiveTasksEdited}
												/>
											}
												value={this.state.maxActiveTasksEdited}
												onChange={this._maxActiveTasksChanged}
											/>
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table>
						}
					/>
				</Segment>

				<Segment>
					<CustomAccordion
						header={
							<Header as='h3'>
								<Icon name='tasks' />
								<Header.Content>
									| Task representation
								</Header.Content>
							</Header>
						}
						content={
							<div>
								<Grid columns='equal' reversed='computer'>
									<Grid.Row>
										<Grid.Column textAlign='right'>
											<Helper
												header='Task representation'
												content='This chart show how task are represented in summary of all tasks'
											/>
										</Grid.Column>
									</Grid.Row>
								</Grid>
								<Segment loading={this.state.loading} vertical>
									<TaskStatusRepresentation
										data={this.state.taskstate}
									/>
								</Segment>
							</div>
						}
					/>
				</Segment>

				<Segment>
					<CustomAccordion
						header={
							<Header as='h3'>
								<Icon name='area graph' />
								<Header.Content>
									| CPU usage
								</Header.Content>
							</Header>
						}
						content={
							<div>
								<Grid columns='equal' reversed='computer'>
									<Grid.Row>
										<Grid.Column textAlign='right'>
											<Helper
												header='CPU usage'
												content='This chart shows CPU percentage usage in last 30 seconds'
											/>
										</Grid.Column>
									</Grid.Row>
								</Grid>
								<Segment loading={this.state.loading} vertical>
									<CpuGraph data={this.state.data} />
								</Segment>
							</div>
						}
					/>
				</Segment>
				<Divider hidden />
			</div>
		)
	}
}