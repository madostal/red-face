import React, { Component } from 'react'
import {
    Header,
    Table,
    Rating,
    Button
} from 'semantic-ui-react'

export default class OverviewTable extends Component {

    constructor(props) {
        super(props)

        this._testFunction = this._testFunction.bind(this);

        this.componentList = [
            <TabRow name="SomeName1" key={1}/>,
            <TabRow name="SomeName2" key={2}/>
        ];
    }

    _testFunction(number) {
        this.componentList.push(<TabRow name="SomeName2" key={3} />);
        this.forceUpdate();
    }



    render() {

        return (
            <div>
                <Table celled padded selectable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell singleLine>Evidence Rating</Table.HeaderCell>
                            <Table.HeaderCell>Effect</Table.HeaderCell>
                            <Table.HeaderCell>Efficacy</Table.HeaderCell>
                            <Table.HeaderCell>Consensus</Table.HeaderCell>
                            <Table.HeaderCell>Comments</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                <Header as='h2' textAlign='center'>A</Header>
                            </Table.Cell>
                            <Table.Cell singleLine>Power Output</Table.Cell>
                            <Table.Cell>
                                <Rating icon='star' defaultRating={3} maxRating={3} />
                            </Table.Cell>
                            <Table.Cell textAlign='right'>
                                80% <br />
                                <a href='#'>18 studies</a>
                            </Table.Cell>
                            <Table.Cell>
                                Creatine supplementation is the reference compound for increasing muscular creatine levels; there is
            variability in this increase, however, with some nonresponders.
                    </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                <Header as='h2' textAlign='center'>A</Header>
                            </Table.Cell>
                            <Table.Cell singleLine>Weight</Table.Cell>
                            <Table.Cell>
                                <Rating icon='star' defaultRating={3} maxRating={3} />
                            </Table.Cell>
                            <Table.Cell textAlign='right'>
                                100% <br />
                                <a href='#'>65 studies</a>
                            </Table.Cell>
                            <Table.Cell>
                                Creatine is the reference compound for power improvement, with numbers from one meta-analysis to assess
                                potency
                            </Table.Cell>
                        </Table.Row>

                        {this.componentList}

                    </Table.Body>
                </Table>
                <Button onClick={this._testFunction} inverted color='red' size='tiny'>Test</Button>
            </div>
        )
    }
}

class TabRow extends Component {
    render() {
        return (

            <Table.Row key={1}>
                <Table.Cell>
                    <Header as='h2' textAlign='center'>A</Header>
                </Table.Cell>
                <Table.Cell singleLine>Weight</Table.Cell>
                <Table.Cell>
                    <Rating icon='star' defaultRating={3} maxRating={3} />
                </Table.Cell>
                <Table.Cell textAlign='right'>
                    22% <br />
                    <a href='#'>65 studies</a>
                </Table.Cell>
                <Table.Cell>
                    test
                     </Table.Cell>
            </Table.Row>

        )
    }
}