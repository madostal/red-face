import React from 'react'
import browserHistory from 'react-router'
import {
	Icon,
	Button,
	Modal,
	Header,
	Loader,
	Table,
	Divider,
} from 'semantic-ui-react'
import Api from 'utils/Api'
import Library from 'utils/Library'

export default class OverviewTable extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			result: [],
			redirect: false,
			modalRemoveTaskOpen: false,
			modalStopTaskOpen: false,
			modalRepeatOpen: false,
			modalRemoveAll: false,
		}

		Api.getSocket().on('update-overview', function (data) {
			let lastRowData = this.state.result
			lastRowData.forEach(function (loop) {
				if (loop.id === data.taskdone) {
					loop.state = 2
					loop.endTime = data.endTime
				}
			})

			this.state = {
				result: lastRowData,
			}

			this.forceUpdate()
		}.bind(this))

		Api.getSocket().on('there-are-tasks', function (data) {
			let rowData = []
			data.reverse().forEach(function (loop) {
				let tmp = {
					id: loop.id,
					addTime: (loop.addTime),
					startTime: (loop.startTime),
					endTime: (loop.endTime),
					state: loop.state,
					key: [loop.id, loop.taskKey].join('_'),
				}
				rowData.push(tmp)
			})

			this.setState({
				result: rowData,
			})
			console.log(this.state)
			// this.forceUpdate()
		}.bind(this))

		Api.socketRequest('give-me-tasks', {})
	}

	_open(e, item) {
		browserHistory.push(['/detail-section?key=', item.key].join(''))
	}

	_repeat(item) {
		console.log('Calling repeat task id: ' + item.id)
		Api.socketRequest('repeat-task', { id: item.id })
		//TODO UPDATE VIEW
	}

	_removeAll() {
		Api.socketRequest('remove-all-tasks', {})
	}

	_stop(item) {
		console.log('Calling stop task id: ' + item.id)
		Api.socketRequest('stop-task', { id: item.id })
	}

	_delete(item) {
		Api.socketRequest('remove-task', { id: item.id })

		let { result } = this.state
		let index = result.indexOf(item)

		if (index > -1) {
			result.splice(index, 1)
		}
		this.forceUpdate()
	}

	componentDidMount() {
		let self = this
		this.interval = setInterval(function () {
			self.forceUpdate()
		}, 1000)
		for (let i = 0; i < 10; i++) {
			console.log(i)
		}
	}

	componentWillUnmount() {
		clearInterval(this.interval)
		Api.getSocket().removeAllListeners('there-are-tasks')
		Api.getSocket().removeAllListeners('update-overview')
	}

	render() {
		let { result } = this.state
		return (
			<div>
				<Table celled padded selectable>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell singleLine>ID</Table.HeaderCell>
							<Table.HeaderCell>Addtime</Table.HeaderCell>
							<Table.HeaderCell>StartTime</Table.HeaderCell>
							<Table.HeaderCell>EndTime</Table.HeaderCell>
							<Table.HeaderCell>State</Table.HeaderCell>
							<Table.HeaderCell>Open</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					{result && result.length > 0 && (
						<Table.Body>
							{result.map((item) => {
								return (

									<Table.Row key={item.id}>
										<Table.Cell>
											{item.id}
										</Table.Cell>
										<Table.Cell singleLine>
											{Library.timeToHumanReadable(new Date(item.addTime))}
										</Table.Cell>
										<Table.Cell>
											{Library.timeToHumanReadable(new Date(item.startTime))}
										</Table.Cell>
										<Table.Cell>
											{
												((function () {
													switch (item.state) {
														case 1:
															return Library.timeDiffNow(new Date(item.startTime))
														default:
															return Library.timeToHumanReadable(new Date(item.endTime))
													}
												})())
											}
										</Table.Cell>
										<Table.Cell textAlign="center">
											{
												((function () {
													switch (item.state) {
														case 0:
															return <Icon name="wait" size="large" />
														case 1:
															return <Loader active inline size="small" />
														case 2:
															return <Icon name="checkmark" size="large" />
														case 3:
															return <Icon name="exclamation triangle" size="large" />
														case 4:
															return <Icon name="crosshairs" size="large" />
														default:
															return null
													}
												})())
											}
										</Table.Cell>
										<Table.Cell textAlign="center">
											<Button onClick={(e) => this._open(e, item)} color="blue" icon><Icon name="search" /></Button>


											<Modal size="tiny" trigger={<Button disabled={item.state === 1} color="green" icon onClick={() => this.setState({ modalRepeatOpen: true })}><Icon name="repeat" /></Button>} open={this.state.modalRepeatOpen}>
												<Header icon="trash" content="Remove task?" />
												<Modal.Content>Are you sure, that you want to repeat this task?</Modal.Content>
												<Modal.Actions>
													<Button color="red" onClick={() => {
														this.setState({
															modalRepeatOpen: false,
														})
													}}>
														<Icon name="remove" /> No
												</Button>
													<Button color="green" onClick={() => {
														this.setState({
															modalRepeatOpen: false,
														})

														this._repeat(item)
													}}>
														<Icon name="checkmark" /> Yes
												</Button>
												</Modal.Actions>
											</Modal>

											<Modal size="tiny" trigger={<Button disabled={item.state === 1} inverted color="red" icon onClick={() => this.setState({ modalRemoveTaskOpen: true })}><Icon name="trash" /></Button>} open={this.state.modalRemoveTaskOpen}>
												<Header icon="trash" content="Remove task?" />
												<Modal.Content>Are you sure, that you want to remove this task?</Modal.Content>
												<Modal.Actions>
													<Button color="red" onClick={() => {
														console.log('NO')
														console.log(item.id)
														this.setState({
															modalRemoveTaskOpen: false,
														})
													}}>
														<Icon name="remove" /> No
												</Button>
													<Button color="green" onClick={() => {
														console.log('YES')
														const tmp = item.id
														console.log("AAAAAAAAAAAAAAAAAAAAA : " + tmp)
														console.log(item.id)
														this.setState({
															modalRemoveTaskOpen: false,
														})

														this._delete(item)
													}}>
														<Icon name="checkmark" /> Yes
													</Button>
												</Modal.Actions>
											</Modal>

											<Modal size="tiny" trigger={<Button disabled={item.state !== 1} inverted color="orange" icon onClick={() => this.setState({ modalStopTaskOpen: true })}><Icon name="stop" /></Button>} open={this.state.modalStopTaskOpen}>
												<Header icon="trash" content="Stop task?" />
												<Modal.Content>Are you sure, that you want to stop this task?</Modal.Content>
												<Modal.Actions>
													<Button color="red" onClick={() => {
														this.setState({
															modalStopTaskOpen: false,
														})
													}}>
														<Icon name="remove" /> No
												</Button>
													<Button color="green" onClick={() => {
														this.setState({
															modalStopTaskOpen: false,
														})

														this._stop(item)
													}}>
														<Icon name="checkmark" /> Yes
												</Button>
												</Modal.Actions>
											</Modal>
										</Table.Cell>
									</Table.Row>
								)
							})}
						</Table.Body>
					)}
				</Table>
				<Divider hidden />
				<Modal size="tiny" trigger={<Button color="red" icon onClick={() => this.setState({ modalRemoveAll: true })}>Remove all<Icon name="trash" /></Button>} open={this.state.modalRemoveAll}>
					<Header icon="trash" content="Remove task?" />
					<Modal.Content>Are you sure, that you want to ALL tasks? </Modal.Content>
					<Modal.Actions>
						<Button color="red" onClick={() => {
							this.setState({
								modalRemoveAll: false,
							})
						}}>
							<Icon name="remove" /> No
												</Button>
						<Button color="green" onClick={() => {
							console.log(this.state)
							this.setState({
								modalRemoveAll: false,
							})
							console.log(this.state)
							this._removeAll()
						}}>
							<Icon name="checkmark" /> Yes
												</Button>
					</Modal.Actions>
				</Modal>
			</div>
		)
	}
}