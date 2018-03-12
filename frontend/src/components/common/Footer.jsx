import React from 'react'
import {
	Sidebar,
	Menu,
	Icon,
} from 'semantic-ui-react'
import ScrollToTop from 'react-scroll-up'
import { ToastContainer, toast } from 'react-toastify'
import Api from 'utils/Api'

export default class Footer extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			visible: false,
			toast: 'info',
		}

		this._handleSocket = this._handleSocket.bind(this)
		this._handleSocket()

		this._toastInfo = this._toastInfo.bind(this)
		this._toastSuccess = this._toastSuccess.bind(this)
	}


	_toastInfo = (body) => {
		this.setState({
			toast: 'info',
		})
		toast.info(body)
	}

	_toastSuccess = (body) => {
		this.setState({
			toast: 'success',
		})
		toast.success(body)
	}

	_handleSocket = () => {

		Api.getSocket().on('connect_error', () => {
			this.setState({ visible: true })
		})

		Api.getSocket().on('connect', () => {
			this.setState({ visible: false })
		})

		Api.getSocket().on('task-create', (data) => {
			this._toastInfo('The task ' + data + ' was scheduled')
		})

		Api.getSocket().on('task-start', (data) => {
			this._toastInfo(['Task', data.id, 'was stared'].join(' '))
		})
	}

	render = () => {
		return (
			<div className="create-task-section">
				<ScrollToTop showUnder={160}>
					<Icon name='chevron up' />
				</ScrollToTop>
				<Sidebar as={Menu} animation="overlay" direction="bottom" visible={this.state.visible} inverted>
					<Menu.Item name="home">
						<Icon name="power cord" />
						We are sorry, it's seems that server is down
				</Menu.Item>
				</Sidebar>
				<ToastContainer
					position="bottom-left"
					type={this.state.toast}
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					pauseOnHover
				/>
			</div>
		)
	}
}
