import React, { Component } from "react"

import {
  Tab,
  Segment,
  Grid,
  Button,
  Message,
  Header,
  Input,
  Divider
} from "semantic-ui-react"

import BruteForceTab from "common/createTaskSection/BruteForceTab"
import OtherTab from "common/createTaskSection/OtherTab"
import newId from "../../utils/Newid";

import Api from "utils/Api"

export default class CreateTaskSection extends Component {

  constructor(props) {
    super(props)

    this._createTask = this._createTask.bind(this);
    this._removeAllTasks = this._removeAllTasks.bind(this);

    this.state = {
      setUpVisible: true
    }
  }

  componentWillMount() {
    this.idTaskName = newId();
  }

  _createTask() {
    var bruteForceTab = JSON.parse(localStorage.getItem("BruteForceTab"));
    if (bruteForceTab != null && bruteForceTab.enable === false) {
      bruteForceTab = null;
    }

    var otherTab = JSON.parse(localStorage.getItem("OtherTab"));
    if (otherTab != null && otherTab.enable === false) {
      otherTab = null;
    }

    var json = JSON.stringify({
      data: {
        "taskname": document.getElementById(this.idTaskName).value,
        "taskdata": {
          "bruteforcetab": bruteForceTab,
          "othertab": otherTab
        }
      }
    });
    Api.socketRequest("taskcreate", json);
    this.setState({ setUpVisible: !this.state.setUpVisible });
  }

  _removeAllTasks() {
    localStorage.clear();
    window.location.reload();
  }

  render() {

    const panes = [
      { menuItem: "Brute force", render: () => <Tab.Pane><BruteForceTab /></Tab.Pane> },
      { menuItem: "Other", render: () => <Tab.Pane><OtherTab /></Tab.Pane> },
      { menuItem: "TODO2", render: () => <Tab.Pane >Tab 2 Content</Tab.Pane> },
      { menuItem: "TODO3", render: () => <Tab.Pane >Tab 3 Content</Tab.Pane> },
      { menuItem: "TODO4", render: () => <Tab.Pane >Tab 4 Content</Tab.Pane> },
      { menuItem: "TODO5", render: () => <Tab.Pane >Tab 5 Content</Tab.Pane> },
      { menuItem: "TODO6", render: () => <Tab.Pane >Tab 6 Content</Tab.Pane> },
      { menuItem: "TODO7", render: () => <Tab.Pane >Tab 7 Content</Tab.Pane> },
      { menuItem: "TODO8", render: () => <Tab.Pane >Tab 8 Content</Tab.Pane> },
      { menuItem: "TODO9", render: () => <Tab.Pane loading>Tab 9 Content</Tab.Pane> },
    ]

    return (

      <div className="create-task-section" >

        {this.state.setUpVisible ?
          <Tab panes={panes} /> :
          null
        }

        {this.state.setUpVisible ?
          <Segment>

            <Header as="h3">Starter</Header>
            <Grid divided="vertically">
              <Grid.Row columns={2} textAlign="right">
                <Grid.Column>
                  <Input id={this.idTaskName} placeholder="Task name" />
                </Grid.Column>
                <Grid.Column>
                  <Button onClick={this._createTask} color="green">Start task</Button>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <Divider inverted />
            <Button onClick={this._removeAllTasks} inverted color="red" size="tiny">Remove</Button>
          </Segment> :
          null
        }

        {this.state.setUpVisible ?
          null :
          <Message positive
            icon="check"
            header="Warning"
            content="Your task was created and will be planned in few minutes, go to overview to check status of your task"
          />
        }

      </div >
    )
  }
}