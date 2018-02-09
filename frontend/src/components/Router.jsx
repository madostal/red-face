import React from 'react'
import {
	Router,
	Route,
	browserHistory,
} from 'react-router'
import App from './App'
import CreateTaskPage from './pages/CreateTaskPage'
import OverviewPage from './pages/OverviewPage'
import DetailPage from './pages/DetailPage'
import DashboardPage from './pages/DashboardPage'

export default class DashboardRouter extends React.Component {

	render = () => {
		return (
			<Router history={browserHistory}>
				<Route component={App}>
					<Route path="/" component={DashboardPage} />
					<Route path="/overview" component={OverviewPage} />
					<Route path="/dashboard" component={DashboardPage} />
					<Route path="/create-task" component={CreateTaskPage} />
					<Route path="/detail/:key" component={DetailPage} />
				</Route>
			</Router>
		)
	}
}
