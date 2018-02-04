import React from 'react'
import {
	Button,
	Message,
	Form,
} from 'semantic-ui-react'
import ServerApi from 'utils/ServerApi'

export default class LoginPage extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			login: '',
			psw: '',
			psw2: '',
			errMsg: '',
			succMsg: '',
		}
	}

	_componentOnChangeText = (d, e) => {
		this.setState({
			[e.id]: e.value,
		})
	}

	_handleSubmit = () => {
		this.setState({ errMsg: '' })
		ServerApi.sendPost('api/create-user', this.state, (error, respData) => {
			if (error) { console.log(error) }
			if (respData.res === 'fail') {
				this.setState({
					errMsg: respData.msg,
				})
			} else {
				this.setState({
					succMsg: 'Your account was successfully created',
					login: '',
					psw: '',
					psw2: '',
				})
			}
		})
	}

	render = () => {
		const { login, psw, psw2, errMsg, succMsg } = this.state
		return (
			<div>
				{errMsg.length !== 0 ?
					<Message
						color='red'
						icon='warning sign'
						header='Register failed'
						content={errMsg}
					/>
					: ''
				}
				{succMsg.length !== 0 ?
					<Message
						color='green'
						icon='smile'
						header='Register was successfully'
						content={succMsg}
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
					<Form.Input
						id={'psw2'}
						label='Repeat Password'
						type='password'
						value={psw2}
						onChange={this._componentOnChangeText}
					/>
					<Button type='submit'>Register</Button>
				</Form>
			</div>
		)
	}
}