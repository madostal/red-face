import React, { Component } from "react"

import {
  Message,
  Loader,
  Grid,
  List,
  Icon
} from "semantic-ui-react"

import Api from "utils/Api"

export default class DetailSection extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true
    }

    Api.getSocket().on("there-is-task-detail", function (data) {
      console.log(data[0]);
      console.log(Object.keys(data).length)
      if (Object.keys(data).length > 0) {
        this.state = {
          taskId: data[0].id,
          taskAddTime: data[0].addTime,
          taskStartTime: data[0].startTime,
          taskEndTime: data[0].endTime,
          taskType: data[0].type,
          taskName: data[0].taskName,
          taskKey: data[0].taskKey,
          taskState: data[0].state,
          loading: false
        }
        this.forceUpdate();
      }
    }.bind(this));

    Api.socketRequest("give-me-task-detail", { key: this.props.location.query.key });
  }

  render() {
    let { loading, taskId, taskAddTime, taskStartTime, taskEndTime, taskType, taskName, taskKey, taskState } = this.state
    return (
      <div className="home-section">

        {loading && (
          <div>
            <Loader active />
          </div>
        )}

        {!loading && !taskId && (
          <Message error
            icon="warning sign"
            header="This task does not exist"
            list={
              [
                "Do you have the right link?",
                "The task could be deleted.",
                "Or any other unexpected error occurred."
              ]
            }
          />
        )}

        {taskId && (
          <Grid celled>
            <Grid.Row>
              <Grid.Column width={13} textAlign="left">
                <List>
                  <List.Item>
                    <List.Header>
                      ID
                    </List.Header>
                    <List.Description>
                      {taskId}
                    </List.Description>
                  </List.Item>
                  <List.Item>
                    <List.Header>
                      Addtime
                        </List.Header>
                    <List.Description>
                      {taskAddTime}
                    </List.Description>
                  </List.Item>
                  <List.Item>
                    <List.Header>
                      Startime
                        </List.Header>
                    <List.Description>
                      {taskStartTime}
                    </List.Description>
                  </List.Item>
                  <List.Item>
                    <List.Header>
                      Endtime
                        </List.Header>
                    <List.Description>
                      {taskEndTime}
                    </List.Description>
                  </List.Item>
                  <List.Item>
                    <List.Header>
                      Type
                        </List.Header>
                    <List.Description>
                      {taskType}
                    </List.Description>
                  </List.Item>
                  <List.Item>
                    <List.Header>
                      Taskname
                        </List.Header>
                    <List.Description>
                      {taskName}
                    </List.Description>
                  </List.Item>
                  <List.Item>
                    <List.Header>
                      Taskkey
                        </List.Header>
                    <List.Description>
                      {taskKey}
                    </List.Description>
                  </List.Item>
                  <List.Item>
                    <List.Header>
                      State
                        </List.Header>
                    <List.Description>
                      {taskState}
                    </List.Description>
                  </List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3} textAlign="center" verticalAlign="middle">

                {(function () {
                  switch (taskState) {
                    case 0:
                      return <Icon name="wait" size="huge" />;
                    case 1:
                      return <Loader active inline size="massive" />;
                    case 2:
                      return <Icon name="checkmark" size="huge" />;
                    case 3:
                      return <Icon name="exclamation triangle" size="huge" />;
                    default:
                      return null;
                  }
                })()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
        <List>
          <List.Item>Apples</List.Item>
          <List.Item>Pears</List.Item>
          <List.Item>Oranges</List.Item>
        </List>
      </div>
    )
  }
}