import React, { Component } from 'react'
import {
    Table,
    Loader
} from 'semantic-ui-react'

import { Link } from 'react-router'
import {
    Menu,
    Icon
} from 'semantic-ui-react'


import Api from 'utils/Api'
import Library from 'utils/Library'

export default class OverviewTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            result: []
        }

        Api.getSocket().on('update-overview', function (data) {
            var lastRowData = this.state.result;
            lastRowData.reverse().forEach(function (loop) {
                if (loop.id === data.taskdone) {
                    loop.state = 2;
                    loop.endTime = data.endTime;
                }
            });
            this.state = {
                result: lastRowData
            }

            this.forceUpdate()
        }.bind(this));

        Api.getSocket().on('there-are-tasks', function (data) {
            var rowData = [];
            data.reverse().forEach(function (loop) {
                var tmp = {
                    id: loop.id,
                    addTime: Library.mySQLDateToHumanReadable(loop.addTime),
                    startTime: Library.mySQLDateToHumanReadable(loop.startTime),
                    endTime: Library.mySQLDateToHumanReadable(loop.endTime),
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
                                                        return <Icon name='wait' size='large' />;
                                                    case 1:
                                                        return <Loader active inline size="small" />;
                                                    case 2:
                                                        return <Icon name='checkmark' size='large' />;
                                                    default:
                                                        return null;
                                                }
                                            })()}
                                        </Table.Cell>
                                        <Table.Cell textAlign='center'>
                                            <Menu.Item as={Link} to={['/detail-section?key=', item.key].join("")}>
                                                <Icon name='search' size='large' />
                                            </Menu.Item>
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