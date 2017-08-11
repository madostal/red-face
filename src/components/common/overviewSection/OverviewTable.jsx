import React, { Component } from 'react'
import {
    Table
} from 'semantic-ui-react'

import Api from 'utils/Api'

export default class OverviewTable extends Component {

    constructor(props) {
        super(props)

        this.componentList = [];

        Api.getSocket().on('update-overview', function (data) {
            console.log(data);
        }.bind(this));

        Api.getSocket().on('there-are-tasks', function (data) {
            for (var i = 0; i < data.length; i++) {
                this.componentList.push(
                    <TabRow
                        id={data[i].id}
                        addTime={data[i].addTime}
                        startTime={data[i].startTime}
                        endTime={data[i].endTime}
                        state={data[i].state}
                        key={i}
                    />
                );
            }
            this.forceUpdate();
        }.bind(this));

        Api.socketRequest("give-me-tasks", {});
    }

    render() {
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
                    <Table.Body>
                        {this.componentList}
                    </Table.Body>
                </Table>
            </div>
        )
    }
}

class TabRow extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Table.Row>
                <Table.Cell>
                    {this.props.id}
                </Table.Cell>
                <Table.Cell singleLine>
                    {this.props.addTime}
                </Table.Cell>
                <Table.Cell>
                    {this.props.startTime}
                </Table.Cell>
                <Table.Cell>
                    {this.props.endTime}
                </Table.Cell>
                <Table.Cell>
                    {this.props.state}
                </Table.Cell>
            </Table.Row>
        )
    }
}