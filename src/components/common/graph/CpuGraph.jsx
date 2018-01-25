import React from 'react'
import Api from 'utils/Api'

export default class CpuGraph extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			cpupercentage: NaN,
		}

		Api.getSocket().on('system-stats', (data) => {
			this.setState({
				cpupercentage: data.cpu,
			})
		})
	}

	componentWillUnmount = () => {
		Api.getSocket().removeAllListeners('system-stats')
	}

	render = () => {
		return (
			<div>
				{this.state.cpupercentage}
			</div>
		)
	}
}
