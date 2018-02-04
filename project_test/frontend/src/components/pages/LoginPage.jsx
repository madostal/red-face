import React from 'react'
import {
	Button,
	Form,
	Message,
} from 'semantic-ui-react'
import { browserHistory } from 'react-router'
import CookieWorker from 'utils/CookieWorker'
import ServerApi from 'utils/ServerApi'

export default class LoginPage extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			login: '',
			psw: '',
			errMsg: '',
		}
	}

	_componentOnChangeText = (d, e) => {
		this.setState({
			[e.id]: e.value,
		})
	}

	_handleSubmit = () => {
		this.setState({ errMsg: '' })
		ServerApi.sendPost('api/login-user', { login: this.state.login, psw: this.state.psw }, (error, respData) => {
			if (error) { console.log(error) }
			if (respData.res === 'fail') {
				this.setState({
					errMsg: 'fail',
				})
			} else {
				CookieWorker.setCookie('username', this.state.login, 1)
				browserHistory.push('/list')
			}
		})
	}

	render = () => {
		const { login, psw, errMsg } = this.state
		return (
			<div>
				{errMsg.length !== 0
					? <Message
						key={Math.random()}
						color='red'
						icon='warning sign'
						header='Login failed'
						content={''}
					/>
					: ''
				}
				<Form onSubmit={this._handleSubmit}>
					<Form.Input
						id={'login'}
						label='Username'
						type='text'
						value={login}
						onChange={this._componentOnChangeText}
					/>
					<Form.Input
						id={'psw'}
						label='Password'
						type='password'
						value={psw}
						onChange={this._componentOnChangeText}
					/>
					<Button type='submit'>Login</Button>
				</Form>
			</div>
		)
	}
}