import React, { Component } from "react"
import { browserHistory } from "react-router";
import {
    Menu,
    Icon,
    Button,
    Modal,
    Header,
    Loader,
    Table
} from "semantic-ui-react"

import Api from "utils/Api"
import Library from "utils/Library"

export default class OverviewTable extends Component {

    constructor(props) {
        super(props)

        this.state = {
            result: [],
            redirect: false,
            modalRemoveTaskOpen: false,
            modalStopTaskOpen: false
        }

        Api.getSocket().on("update-overview", function (data) {
            var lastRowData = this.state.result;
            lastRowData.forEach(function (loop) {
                if (loop.id === data.taskdone) {
                    loop.state = 2;
                    loop.endTime = data.endTime;
                }
            });

            this.setState = {
                result: lastRowData
            }

            this.forceUpdate()
        }.bind(this));

        Api.getSocket().on("there-are-tasks", function (data) {
            var rowData = [];
            data.reverse().forEach(function (loop) {
                var tmp = {
                    id: loop.id,
                    addTime: (loop.addTime),
                    startTime: (loop.startTime),
                    endTime: (loop.endTime),
                    state: loop.state,
                    key: [loop.id, loop.taskKey].join("_")
                }
                rowData.push(tmp);
            });

            this.state = {
                result: rowData
            }

            this.forceUpdate();
        }.bind(this));

        Api.socketRequest("give-me-tasks", {});
    }

    _open(e, item) {
        browserHistory.push(["/detail-section?key=", item.key].join(""));
    }

    _repeat(e, item) {
        console.log(item);
        this.setState({ setUpVisible: !this.state.setUpVisible });
    }

    _delete(item) {
        Api.socketRequest("remove-task", { id: item.id });

        let { result } = this.state;
        var index = result.indexOf(item);

        if (index > -1) {
            result.splice(index, 1);
        }
        this.forceUpdate();
    }

    componentDidMount() {
        var self = this;
        this.interval = setInterval(function () {
            var lastRowData = self.state.result;
            lastRowData.forEach(function (loop) {
                if (loop.state === 1) {
                    loop.endTime = Library.msToHumanReadable(new Date().getTime() - new Date(loop.startTime).getTime());
                }
            });

            self.state = {
                result: lastRowData
            }
            self.forceUpdate()
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        Api.getSocket().removeAllListeners("there-are-tasks");
        Api.getSocket().removeAllListeners("update-overview");
    }

    render() {
        let { result } = this.state
        return (
            <div>
                <Table celled padded selectable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell singleLine>ID</Table.HeaderCell>
                            <Table.HeaderCell>Addtime</Table.HeaderCell>
                            <Table.HeaderCell>StartTime</Table.HeaderCell>
                            <Table.HeaderCell>EndTime</Table.HeaderCell>
                            <Table.HeaderCell>State</Table.HeaderCell>
                            <Table.HeaderCell>Open</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    {result && result.length > 0 && (
                        <Table.Body>
                            {result.map((item) => {
                                return (

                                    <Table.Row key={item.id}>
                                        <Table.Cell>
                                            {item.id}
                                        </Table.Cell>
                                        <Table.Cell singleLine>
                                            {item.addTime}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.startTime}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.endTime}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            {(function () {
                                                switch (item.state) {
                                                    case 0:
                                                        return <Icon name="wait" size="large" />;
                                                    case 1:
                                                        return <Loader active inline size="small" />;
                                                    case 2:
                                                        return <Icon name="checkmark" size="large" />;
                                                    case 3:
                                                        return <Icon name="exclamation triangle" size="large" />;
                                                    default:
                                                        return null;
                                                }
                                            })()}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <Button onClick={(e) => this._open(e, item)} color="blue" icon><Icon name="search" /></Button>
                                            <Button onClick={(e) => this._repeat(e, item)} color="green" icon><Icon name="repeat" /></Button>

                                            <Modal size="tiny" trigger={<Button inverted color="red" icon><Icon name="trash" /></Button>} open={this.state.modalRemoveTaskOpen}>
                                                <Header icon="trash" content="Remove task?" />
                                                <Modal.Content>Are you sure, that you want to remove this task?</Modal.Content>
                                                <Modal.Actions>
                                                    <Button color="red" onClick={() => {
                                                        console.log("NO");
                                                        console.log(item.id);
                                                        this.setState({
                                                            modalRemoveTaskOpen: false,
                                                        })
                                                    }}>
                                                        <Icon name="remove" /> No
                                              </Button>
                                                    <Button color="green" onClick={() => {
                                                        console.log("YES");
                                                        console.log(item.id);
                                                        this.setState({
                                                            modalRemoveTaskOpen: false,
                                                        })

                                                        this._delete(item);
                                                    }}>
                                                        <Icon name="checkmark" /> Yes
                                              </Button>
                                                </Modal.Actions>
                                            </Modal>


                                            <Modal size="tiny" trigger={<Button inverted color="orange" icon><Icon name="stop" /></Button>} open={this.state.modalStopTaskOpen}>
                                                <Header icon="stop" content="Stop task?" />
                                                <Modal.Content>Are you sure, that you want to stop this task?</Modal.Content>
                                                <Modal.Actions>
                                                    <Button color="red" onClick={() => {
                                                        console.log("NO");
                                                        console.log(item.id);
                                                        this.setState({
                                                            modalStopTaskOpen: false,
                                                        })
                                                    }}>
                                                        <Icon name="remove" /> No
                                              </Button>
                                                    <Button color="green" onClick={() => {
                                                        console.log("YES");
                                                        console.log(item.id);
                                                        this.setState({
                                                            modalStopTaskOpen: false,
                                                        })
                                                    }}>
                                                        <Icon name="checkmark" /> Yes
                                              </Button>
                                                </Modal.Actions>
                                            </Modal>

                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })}
                        </Table.Body>
                    )}
                </Table>
            </div>
        )
    }
}