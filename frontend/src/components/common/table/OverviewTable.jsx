import React from 'react'
import { Link } from 'react-router'
import {
	Icon,
	Button,
	Modal,
	Segment,
	Header,
	Loader,
	Table,
	Dropdown,
	Menu,
	Grid,
	Divider,
} from 'semantic-ui-react'

import TableNotes from './TableNotes'
import TableFilter from './TableFiltex'
import Api from 'utils/Api'
import Library from 'utils/Library'

const PAGGING_OPTIONS = [
	{ key: 1, text: '10', value: 10 },
	{ key: 2, text: '50', value: 50 },
	{ key: 3, text: '100', value: 100 },
	{ key: 4, text: '1000', value: 100 },
]

export default class OverviewTable extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			isLoading: true,
			originalData: [],
			result: [],
			redirect: false,
			modalRemoveTaskOpen: {},
			modalStopTaskOpen: {},
			modalRepeatOpen: {},
			modalRemoveAll: false,

			tableActivePage: 0,
			tableActiveIndexDd: PAGGING_OPTIONS[0].value,
			tableCountOfPages: 0,

			filter: [true, true, true, true, true],
		}

		Api.socketRequest('give-me-tasks', {})

		Api.getSocket().on('update-overview', (data) => {
			let lastRowData = this.state.result
			lastRowData.forEach((loop) => {
				if (loop.id === data.taskdone) {
					loop.state = 2
					loop.endTime = data.endTime
				}
			})

			this.setState({
				c: lastRowData,
			})
		})

		Api.getSocket().on('there-are-tasks', (data) => {
			let rowData = []
			data.reverse().forEach((loop) => {
				let tmp = {
					serverHome: loop.serverHome,
					taskname: loop.taskName,
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
				originalData: rowData,
				isLoading: false,
			})
			this._paggingAction(PAGGING_OPTIONS[0].value)
			this._switchPage(0)
		})
	}

	componentDidMount = () => {
		this.interval = setInterval(() => {
			let r = this.state.result
			r.forEach(e => {
				if (e.state === 1) {
					e.startTime = (new Date(e.startTime))
				}
			})
			this.setState({
				result: r,
			})
		}, 1000)
	}

	_repeat = (item) => {
		Api.socketRequest('repeat-task', { id: item.id })
		//TODO UPDATE VIEW
	}

	_removeAll = () => {
		this.setState({
			originalData: [],
			result: [],
			redirect: false,
			modalRemoveTaskOpen: {},
			modalStopTaskOpen: {},
			modalRepeatOpen: {},
			modalRemoveAll: false,
		})
		Api.socketRequest('remove-all-tasks', {})
	}

	_stop = (item) => {
		Api.socketRequest('stop-task', { id: item.id })
	}

	_delete = (item) => {
		Api.socketRequest('remove-task', { id: item.id })

		let { result } = this.state
		let index = result.indexOf(item)

		if (index > -1) {
			result.splice(index, 1)
		}
		this.forceUpdate()
	}

	componentWillUnmount = () => {
		clearInterval(this.interval)
		Api.getSocket().removeAllListeners('there-are-tasks')
		Api.getSocket().removeAllListeners('update-overview')
	}

	_modalAction = (itemid, open, modalstate) => {
		let tmp = this.state[modalstate]
		tmp[itemid] = open
		this.setState({ [modalstate]: tmp })
	}

	_switchPage = (activePage, tableActiveIndexDdIn) => {
		let resData = []
		if (!tableActiveIndexDdIn) {
			tableActiveIndexDdIn = this.state.tableActiveIndexDd
		}
		let down = activePage * tableActiveIndexDdIn
		let top = (activePage * tableActiveIndexDdIn) + tableActiveIndexDdIn

		for (let i = down; i < top; i++) {
			if (this.state.originalData[i]) {
				if (this.state.filter[this.state.originalData[i].state])
					resData.push(this.state.originalData[i])
			}
		}
		this.setState({
			tableActivePage: activePage,
			result: resData,
		})
		this.forceUpdate()
	}

	_paggingAction = (value) => {
		let cop = Math.ceil(this.state.originalData.length / value) - 1
		this.setState({
			tableCountOfPages: cop,
			tableActiveIndexDd: value,
		})
		this._switchPage(0, value)
	}

	_paggingDropDownClick = (e, { value }) => {
		this._paggingAction(value)
	}

	_pageUp = () => {
		if (this.state.tableActivePage === this.state.tableCountOfPages) {
			return
		}
		let activePage = this.state.tableActivePage + 1
		this.setState({
			tableActivePage: activePage,
		})
		this._switchPage(activePage)
	}

	_pageUpLast = () => {
		let activePage = this.state.tableCountOfPages
		this.setState({
			tableActivePage: activePage,
		})
		this._switchPage(activePage)
	}

	_pageDown = () => {
		if (this.state.tableActivePage === 0) {
			return
		}
		let activePage = this.state.tableActivePage - 1
		this.setState({
			tableActivePage: activePage,
		})
		this._switchPage(activePage)
	}

	_pageDownLast = () => {
		let activePage = 0
		this.setState({
			tableActivePage: activePage,
		})
		this._switchPage(activePage)
	}

	_selectPage = (e, { name }) => {
		this.setState({
			tableActivePage: parseInt(name),
		})
		this._switchPage(name)
	}

	_buildPaggingItem = (i) => {
		return <Menu.Item as='a'
			name={i.toString()}
			key={i.toString()}
			onClick={this._selectPage}
			active={this.state.tableActivePage === i}>
			{i + 1}
		</Menu.Item>
	}

	filterAction = (id) => {
		let arr = this.state.filter
		arr[id] = !arr[id]
		this.setState({
			filter: arr,
		})

		this._switchPage(this.state.tableActivePage)
	}

	render = () => {
		let { result, isLoading } = this.state

		let pagging = []
		let activePage = this.state.tableActivePage
		let countOfPages = this.state.tableCountOfPages

		for (let i = activePage; i >= activePage - 2; i--) {
			if (i < 0) break
			pagging.unshift(this._buildPaggingItem(i))
		}

		for (let i = activePage + 1; i < activePage + 3; i++) {
			if (i > countOfPages) break
			pagging.push(this._buildPaggingItem(i))
		}

		return (
			<Segment vertical loading={isLoading}>
				<Table celled padded selectable>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Name</Table.HeaderCell>
							<Table.HeaderCell>Host</Table.HeaderCell>
							<Table.HeaderCell>Added</Table.HeaderCell>
							<Table.HeaderCell>Started</Table.HeaderCell>
							<Table.HeaderCell>Closed</Table.HeaderCell>
							<Table.HeaderCell>State</Table.HeaderCell>
							<Table.HeaderCell>Action</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					{result && result.length > 0 && (
						<Table.Body>
							{result.map((item) => {
								return (
									<Table.Row key={item.id}>
										<Table.Cell>
											{item.taskname}
										</Table.Cell>
										<Table.Cell>
											<a href={item.serverHome}>{item.serverHome}</a>
										</Table.Cell>
										<Table.Cell singleLine>
											{Library.timeToHumanReadable(new Date(item.addTime))}
										</Table.Cell>
										<Table.Cell>
											{item.startTime
												? Library.timeToHumanReadable(new Date(item.startTime))
												: 'queued'
											}
										</Table.Cell>
										<Table.Cell>
											{
												((function () {
													switch (item.state) {
														case 1:
															if (item.startTime) {
																return Library.timeDiffNow(new Date(item.startTime))
															} else {
																return 'queued'
															}
														default:
															if (item.endTime) {
																return Library.timeToHumanReadable(new Date(item.endTime))
															} else {
																return 'queued'
															}
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
											<Button as={Link} to={['/detail/', item.key].join('')} color="blue" icon><Icon name="search" /></Button>
											<Modal size="tiny" trigger={<Button disabled={item.state === 1} color="green" icon onClick={() => this._modalAction(item.id, true, 'modalRepeatOpen')}><Icon name="repeat" /></Button>} open={this.state.modalRepeatOpen[item.id] || false}>
												<Header icon="trash" content="Remove task?" />
												<Modal.Content>Are you sure, that you want to repeat this task?</Modal.Content>
												<Modal.Actions>
													<Button color="red" onClick={() => {
														this._modalAction(item.id, false, 'modalRepeatOpen')
													}}>
														<Icon name="remove" /> No
												</Button>
													<Button color="green" onClick={() => {
														this._modalAction(item.id, false, 'modalRepeatOpen')
														this._repeat(item)
													}}>
														<Icon name="checkmark" /> Yes
												</Button>
												</Modal.Actions>
											</Modal>

											<Modal size="tiny" trigger={<Button disabled={item.state === 1} inverted color="red" icon onClick={() => { this._modalAction(item.id, true, 'modalRemoveTaskOpen') }}><Icon name="trash" /></Button>} open={this.state.modalRemoveTaskOpen[item.id] || false}>
												<Header icon="trash" content="Remove task?" />
												<Modal.Content>Are you sure, that you want to remove this task?</Modal.Content>
												<Modal.Actions>
													<Button color="red" onClick={() => {
														this._modalAction(item.id, false, 'modalRemoveTaskOpen')
													}}>
														<Icon name="remove" /> No
												</Button>
													<Button color="green" onClick={() => {
														this._modalAction(item.id, false, 'modalRemoveTaskOpen')
														this._delete(item)
													}}>
														<Icon name="checkmark" /> Yes
													</Button>
												</Modal.Actions>
											</Modal>

											<Modal size="tiny" trigger={<Button disabled={item.state !== 1} inverted color="orange" icon onClick={() => this._modalAction(item.id, true, 'modalStopTaskOpen')}><Icon name="stop" /></Button>} open={this.state.modalStopTaskOpen[item.id] || false}>
												<Header icon="trash" content="Stop task?" />
												<Modal.Content>Are you sure, that you want to stop this task?</Modal.Content>
												<Modal.Actions>
													<Button color="red" onClick={() => {
														this._modalAction(item.id, false, 'modalStopTaskOpen')
													}}>
														<Icon name="remove" /> No
												</Button>
													<Button color="green" onClick={() => {
														this._modalAction(item.id, false, 'modalStopTaskOpen')
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
					<Table.Footer>
						<Table.Row>
							<Table.HeaderCell colSpan='100%'>
								<Grid columns='equal' reversed='computer'>
									<Grid.Row>
										<Grid.Column textAlign='right'>
											<Menu floated='right' pagination>
												<Menu.Item as='a' icon onClick={this._pageDownLast}>
													<Icon name='left chevron' />
													<Icon name='left chevron' />
												</Menu.Item>
												<Menu.Item as='a' icon onClick={this._pageDown}>
													<Icon name='left chevron' />
												</Menu.Item>
												{pagging}
												<Menu.Item as='a' icon onClick={this._pageUp}>
													<Icon name='right chevron' />
												</Menu.Item>
												<Menu.Item as='a' icon onClick={this._pageUpLast}>
													<Icon name='right chevron' />
													<Icon name='right chevron' />
												</Menu.Item>
												<Menu.Item>
													{this.state.tableCountOfPages + 1}
												</Menu.Item>
											</Menu>
										</Grid.Column>
										<Grid.Column textAlign='left'>
											<Dropdown value={this.state.tableActiveIndexDd}
												compact
												selection
												options={PAGGING_OPTIONS}
												onChange={this._paggingDropDownClick}
											/>
										</Grid.Column>
									</Grid.Row>
								</Grid>
								<Divider />
								<TableFilter clickCb={this.filterAction} />
							</Table.HeaderCell>
						</Table.Row>
					</Table.Footer>
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
							this.setState({
								modalRemoveAll: false,
							})
							this._removeAll()
						}}>
							<Icon name="checkmark" /> Yes
												</Button>
					</Modal.Actions>
				</Modal>
				<Divider />
				<Segment basic clearing floated='right' size='mini'>
					<Header as='h5'>Explanation of the table</Header>
					<TableNotes />
				</Segment>
				<Divider hidden />
			</Segment>
		)
	}
}