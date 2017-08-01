
import React, { Component } from 'react'
import {
  Router,
  Route,
  browserHistory
} from 'react-router'

import App from './App'
import HomeSection from './HomeSection'
import CreateTaskSection from './CreateTaskSection'

export default class DashboardRouter extends React.Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route component={App}>
          <Route path='/' component={HomeSection} />
          <Route path='/home' component={HomeSection} />
          <Route path='/items' component={HomeSection} />
          <Route path='/create-task' component={CreateTaskSection} />
        </Route>
      </Router>
    )
  }
}
