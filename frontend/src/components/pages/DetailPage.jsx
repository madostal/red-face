import React from 'react'
import {
	Message,
	Loader,
	Grid,
	List,
	Header,
	Checkbox,
	Divider,
} from 'semantic-ui-react'
import PropTypes from 'prop-types'
import State from './../common/State'
import SanitizedHTML from 'react-sanitized-html'
import Api from 'utils/Api'
import Library from 'utils/Library'

export default class DetailPage extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			loading: true,
			updateBinded: false,
			autoScroll: true,
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
					log: this._regexLog(data.log),
				})
				if (!this.state.updateBinded) {
					this.setState({
						updateBinded: true,
					})

					if (this.state.taskState === 1) {
						//task running
						Api.getSocket().on(['detail-', this.state.taskId].join(''), (data) => {

							this.setState({
								log: this.state.log + this._regexLog(data.data),
							})
							if (this.state.autoScroll) {
								document.getElementById('log-area').scrollIntoView()
							}
						})
					}
				}
			}
		})

		Api.socketRequest('give-me-task-detail', { key: this.props.params.key })
	}

	_regexLog = (log) => {
		if (!log) return log
		let tmp = log

		tmp = tmp.replace(/.*(: vulnerability level: 0).*/g, '<div class="vulnerability test-res">$&</div>')
		tmp = tmp.replace(/(: vulnerability level: 0)/g, '')

		tmp = tmp.replace(/.*(: vulnerability level: 1).*/g, '<div class="no-vulnerability test-res">$&</div>')
		tmp = tmp.replace(/(: vulnerability level: 1)/g, '')

		tmp = tmp.replace(/.*(: vulnerability level: 2).*/g, '<div class="default-vulnerability test-res">$&</div>')
		tmp = tmp.replace(/(: vulnerability level: 2)/g, '')


		tmp = tmp.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g, '<a href=\'$&\'>$&</a>')
		tmp = tmp.replace(/\d{1,2}.\d{1,2}.\d{4} \d{1,2}:\d{1,2}:\d{1,2}:/g, '<b>$&</b>')

		tmp = tmp.replace(/\n/g, '<br>')

		let resPart = tmp.split('>TEST RESULTS:')
		return resPart.length === 1 ? resPart[0] : [resPart[1], resPart[0]].join('<br>')
	}

	componentWillUnmount = () => {
		Api.getSocket().removeListener(['detail-', this.state.taskId].join(''))
		Api.getSocket().removeListener('there-is-task-detail')
	}

	_handleAutoscrollCheck = () => {
		this.setState({
			autoScroll: !this.state.autoScroll,
		})
	}

	render = () => {
		let { loading, taskId, taskAddTime, taskStartTime, taskEndTime, taskType, taskName, taskKey, taskState, autoScroll } = this.state

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
								<Header as='h2'>{taskName}</Header>
								<List>
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
								</List>
							</Grid.Column>
							<Grid.Column width={3} textAlign="center" verticalAlign="middle">
								<State state={taskState} />
							</Grid.Column>
							<Divider />
						</Grid.Row>

						<Grid.Row columns={1} textAlign="left">
							<Grid.Column>
								<SanitizedHTML
									allowedAttributes={{ 'a': ['href'], 'div': ['class'] }}
									allowedTags={['b', 'br', 'a', 'div']}
									html={this.state.log}
								/>
								<div id='log-area' />
							</Grid.Column>
						</Grid.Row>
					</Grid>
				)}
				<Grid>
					<Grid.Row>
						<Grid.Column textAlign="right">
							<Checkbox
								onChange={this._handleAutoscrollCheck}
								checked={autoScroll}
								label={{ children: 'Autoscroll' }}
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>
			</div>
		)
	}
}

DetailPage.propTypes = {
	params: PropTypes.shape({
		key: PropTypes.string.isRequired,
	}),
}