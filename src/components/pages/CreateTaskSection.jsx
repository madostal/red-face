import React, { Component } from "react";

import {
  Tab,
  Segment,
  Grid,
  Button,
  Message,
  Header,
  Input,
  Divider,
  Icon
} from "semantic-ui-react";

import { browserHistory } from "react-router";

import BruteForceTab from "common/createTaskSection/BruteForceTab";
import OtherTab from "common/createTaskSection/OtherTab";
import newId from "../../utils/Newid";

import Api from "utils/Api";

function readStorage() {
  return JSON.parse(localStorage.getItem("MainTab"));
}

function createStorageIfNotExist() {
  var json = JSON.stringify({
    "idTaskName": "",
    "idServerHome": ""
  });
  localStorage.setItem("MainTab", json);
  return json;
}

export default class CreateTaskSection extends Component {

  constructor(props) {
    super(props);
    if (localStorage.getItem("MainTab") === null) {
      createStorageIfNotExist();
    }

    this._createTask = this._createTask.bind(this);
    this._removeAllTasks = this._removeAllTasks.bind(this);
  }

  componentWillMount() {
    this.idTaskName = newId();
    this.idServerHome = newId();
  }

  componentDidMount() {
    var json = readStorage();
    document.getElementById(this.idTaskName).value = json.idTaskName;
    document.getElementById(this.idServerHome).value = json.idServerHome;
  }

  componentWillUnmount() {
    this._saveData();
  }

  _saveData() {
    var json = readStorage();
    json.idTaskName = document.getElementById(this.idTaskName).value;
    json.idServerHome = document.getElementById(this.idServerHome).value;
    localStorage.setItem("MainTab", JSON.stringify(json));
  }

  _createTask() {
    this._saveData();
    browserHistory.push("/task-summary");
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
        "serverhome": document.getElementById(this.idServerHome).value,
        "taskdata": {
          "bruteforcetab": bruteForceTab,
          "othertab": otherTab
        }
      }
    });
    Api.socketRequest("taskcreate", json);

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
    ];

    return (

      <div className="create-task-section" >
        <Tab panes={panes} />
        <Segment>
          <Header as="h3">Starter</Header>
          <Grid>
            <Grid.Row columns={2} textAlign="right">
              <Grid.Column>
                <Input id={this.idServerHome} placeholder="Server home" />
              </Grid.Column>
              <Grid.Column>
              </Grid.Column>
            </Grid.Row>
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
        </Segment>
      </div >
    );
  }
}