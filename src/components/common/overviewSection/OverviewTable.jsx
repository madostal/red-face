import React, { Component } from 'react'
import {
    Table
} from 'semantic-ui-react'

import Api from 'utils/Api'

export default class OverviewTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            result: []
        }

        Api.getSocket().on('update-overview', function (data) {
            var lastRowData = this.state.result;
            lastRowData.reverse().forEach(function(loop) {
                if(loop.id === data.taskdone) {
                    loop.state = 2;
                }
            });
            this.state = {
                result:lastRowData
            }

            this.forceUpdate()
        }.bind(this));

        Api.getSocket().on('there-are-tasks', function (data) {
            var rowData = [];
            data.reverse().forEach(function(loop) {
                var tmp = {
                    id:loop.id,
                    addTime:loop.addTime,
                    startTime:loop.startTime,
                    endTime:loop.endTime,
                    state:loop.state
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
                        </Table.Row>
                    </Table.Header>

                        { result && result.length > 0 && (
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
                                        <Table.Cell>
                                            {item.state}
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