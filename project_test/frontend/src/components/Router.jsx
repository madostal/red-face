import React from 'react'
import {
	Router,
	Route,
	browserHistory,
} from 'react-router'
import App from './App'
import HomePage from './pages/HomePage'
import ListPage from './pages/ListPage'
import LoginRegisterPage from './pages/LoginRegisterPage'

export default class DashboardRouter extends React.Component {

	render = () => {
		return (
			<Router history={browserHistory}>
				<Route component={App}>
					<Route path="/" component={HomePage} />
					<Route path="/home" component={HomePage} />
					<Route path="/list" component={ListPage} />
					<Route path="/login" component={LoginRegisterPage} />
				</Route>
			</Router>
		)
	}
}
