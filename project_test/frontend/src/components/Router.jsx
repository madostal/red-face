import React from 'react'
import {
	Router,
	Route,
	browserHistory,
} from 'react-router'
import App from './App'
import Detail from './pages/Detail'
import HomePage from './pages/HomePage'
import ListPage from './pages/ListPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default class DashboardRouter extends React.Component {

	render = () => {
		return (
			<Router history={browserHistory}>
				<Route component={App}>
					<Route path="/" component={HomePage} />
					<Route path="/home" component={HomePage} />
					<Route path="/list" component={ListPage} />
					<Route path="/login" component={LoginPage} />
					<Route path="/register" component={RegisterPage} />
					<Route path="/detail" component={Detail} />
				</Route>
			</Router>
		)
	}
}
