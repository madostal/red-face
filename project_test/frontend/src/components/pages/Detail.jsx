import React from 'react'
import PropTypes from 'prop-types'
import {
	Header,
	Message,
} from 'semantic-ui-react'
import ServerApi from 'utils/ServerApi'

export default class Detail extends React.Component {

	constructor(props) {
		super(props)
		this.state = ({
			data: {
				content: '',
				user: '',
			},
			errMsg: '',
		})
	}

	componentDidMount = () => {
		const id = (this.props.location.query.id)
		ServerApi.sendGet(['api/detail/', id].join(''), (error, respData) => {
			if (error) { console.log(error) }
			if (respData.res === 'fail') {
				this.setState({
					errMsg: respData.msg,
				})
			}
			this.setState({
				data: respData,
			})
		})
	}

	_createDangerPart = (val) => {
		return { __html: val }
	}

	render = () => {
		const id = (this.props.location.query.id)
		const { data, errMsg } = this.state
		return (
			<div>
				<Header as='h1'>Detail</Header>
				{errMsg.length !== 0 ?
					<Message
						color='red'
						icon='warning sign'
						header='Login failed'
						content={errMsg}
					/>
					: ''
				}
				<Header as='h3'>{data.user} </Header>
				<Header as='h3'><div dangerouslySetInnerHTML={this._createDangerPart(id)} /></Header>
				<Header as='h3'>{data.content}</Header>
			</div>
		)
	}
}

Detail.propTypes = {
	location: PropTypes.shape({
		query: PropTypes.shape({
			id: PropTypes.number.isRequired,
		}),
	}),
}