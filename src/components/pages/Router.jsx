
import React, { Component } from "react"
import {
  Router,
  Route,
  browserHistory
} from "react-router"

import App from "./App"
import HomeSection from "./HomeSection"
import CreateTaskSection from "./CreateTaskSection"
import OverviewSection from "./OverviewSection"
import DetailSection from "./DetailSection"

export default class DashboardRouter extends React.Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route component={App}>
          <Route path="/" component={HomeSection} />
          <Route path="/home" component={HomeSection} />
          <Route path="/overview" component={OverviewSection} />
          <Route path="/create-task" component={CreateTaskSection} />
          <Route path="/detail-section" component={DetailSection} />
        </Route>
      </Router>
    )
  }
}
