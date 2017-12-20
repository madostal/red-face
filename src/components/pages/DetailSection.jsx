import React from 'react'
import {
	Message,
	Loader,
	Grid,
	List,
	Icon,
	Divider,
} from 'semantic-ui-react'
import Api from 'utils/Api'
import Library from 'utils/Library'

export default class DetailSection extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			loading: true,
			updateBinded: false,
		}
	}

	componentDidMount = () => {
		Api.getSocket().on('there-is-task-detail', (data) => {
			if (Object.keys(data).length > 0) {
				this.setState({
					taskId: data.id,
					taskAddTime: data.addTime,
					taskStartTime: data.startTime,
					taskEndTime: data.endTime,
					taskType: data.type,
					taskName: data.taskName,
					taskKey: data.taskKey,
					taskState: data.state,
					loading: false,
					log: data.log,
				})
				if (!this.state.updateBinded) {
					this.setState({
						updateBinded: true,
					})

					if (this.state.taskState === 1) {
						//task running
						Api.getSocket().on(['detail-', this.state.taskId].join(''), (data) => {
							this.setState({
								log: this.state.log + data.data
							})
						})
					}
				}
			}
		})

		Api.socketRequest('give-me-task-detail', { key: this.props.location.query.key })
	}

	componentWillUnmount = () => {
		Api.getSocket().removeListener(['detail-', this.state.taskId].join(''))
		Api.getSocket().removeListener('there-is-task-detail')
	}

	render = () => {
		let { loading, taskId, taskAddTime, taskStartTime, taskEndTime, taskType, taskName, taskKey, taskState } = this.state

		return (
			<div className="home-section">

				{loading && (
					<div>
						<Loader active />
					</div>
				)}

				{!loading && !taskId && (
					<Message error
						icon="warning sign"
						header="This task does not exist"
						list={
							[
								'Do you have the right link?',
								'The task could be deleted.',
								'Or any other unexpected error occurred.',
							]
						}
					/>
				)}

				{taskId && (
					<Grid celled>
						<Grid.Row>
							<Grid.Column width={13} textAlign="left">
								<List>
									<List.Item>
										<List.Header>
											ID
									</List.Header>
										<List.Description>
											{taskId}
										</List.Description>
									</List.Item>
									<List.Item>
										<List.Header>
											Addtime
									</List.Header>
										<List.Description>
											{Library.timeToHumanReadable(new Date(taskAddTime))}
										</List.Description>
									</List.Item>
									<List.Item>
										<List.Header>
											Startime
									</List.Header>
										<List.Description>
											{Library.timeToHumanReadable(new Date(taskStartTime))}
										</List.Description>
									</List.Item>
									<List.Item>
										<List.Header>
											Endtime
									</List.Header>
										<List.Description>
											{
												((() => {
													switch (taskState) {
														case 1:
															return 'Running'
														default:
															return Library.timeToHumanReadable(new Date(taskEndTime))
													}
												})())
											}
										</List.Description>
									</List.Item>
									<List.Item>
										<List.Header>
											Type
									</List.Header>
										<List.Description>
											{taskType}
										</List.Description>
									</List.Item>
									<List.Item>
										<List.Header>
											Taskname
									</List.Header>
										<List.Description>
											{taskName}
										</List.Description>
									</List.Item>
									<List.Item>
										<List.Header>
											Taskkey
									</List.Header>
										<List.Description>
											{taskKey}
										</List.Description>
									</List.Item>
									<List.Item>
										<List.Header>
											State
									</List.Header>
										<List.Description>
											{taskState}
										</List.Description>
									</List.Item>
								</List>
							</Grid.Column>
							<Grid.Column width={3} textAlign="center" verticalAlign="middle">

								{
									((() => {
										switch (taskState) {
											case 0:
												return <Icon name="wait" size="huge" />
											case 1:
												return <Loader active inline size="massive" />
											case 2:
												return <Icon name="checkmark" size="huge" />
											case 3:
												return <Icon name="exclamation triangle" size="huge" />
											default:
												return null
										}
									})())
								}
							</Grid.Column>
							<Divider />
						</Grid.Row>

						<Grid.Row columns={1} textAlign="left">
							<Grid.Column>
								<pre>
									{this.state.log}
								</pre>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				)}
			</div>
		)
	}
}