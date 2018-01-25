import React from 'react'
import {
	Router,
	Route,
	browserHistory,
} from 'react-router'
import App from './App'
import CreateTaskPage from './CreateTaskPage'
import OverviewPage from './OverviewPage'
import DetailPage from './DetailPage'
import SystemPage from './SystemPage'

export default class DashboardRouter extends React.Component {

	render = () => {
		return (
			<Router history={browserHistory}>
				<Route component={App}>
					<Route path="/" component={OverviewPage} />
					<Route path="/overview" component={OverviewPage} />
					<Route path="/system" component={SystemPage} />
					<Route path="/create-task" component={CreateTaskPage} />
					<Route path="/detail/:key" component={DetailPage} />
				</Route>
			</Router>
		)
	}
}
