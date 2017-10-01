import React, { Component } from "react"
import {
    Header,
    Checkbox,
    Form,
    TextArea,
    Segment,
    Divider,
    Grid,
    Message
} from "semantic-ui-react"

import newId from "../../../utils/Newid";

import { TASK_DISABLE_WARNING_MESSAGE, TASK_DISABLE_WARNING_MESSAGE_HEADER } from "../../../language/Variables"

function createStorageIfNotExist() {
    var json = JSON.stringify({
        "enable": false,
        data: {
            "idLoginFormXPathExpr": "",
            "idLoginNames": "",
            "idLoginPsw": "",
            "idLoginFormLocation": ""
        }
    });
    localStorage.setItem("BruteForceTab", json);
    return json;
}

function readStorage() {
    return JSON.parse(localStorage.getItem("BruteForceTab"));
}

export default class BruteForceTab extends Component {

    constructor(props) {
        super(props);
        var storage;
        if (localStorage.getItem("BruteForceTab") === null) {
            storage = createStorageIfNotExist();
        } else {
            storage = readStorage();
        }
        var isEnable = storage.enable === true;
        this.state = {
            errorHeader: TASK_DISABLE_WARNING_MESSAGE_HEADER,
            error: (!isEnable) ? TASK_DISABLE_WARNING_MESSAGE : undefined,
            setUpVisible: isEnable,
            xpathFormVisible: true
        }
    }

    _checkBoxAction(e, d) {
        var json = readStorage();

        json.enable = !d.checked;
        if (d.checked) {

            this.setState({ error: TASK_DISABLE_WARNING_MESSAGE })
            this.setState({ setUpVisible: false })

        } else {

            this.setState({ error: undefined })
            this.setState({ setUpVisible: true })

        }
        console.log("STAV PO: " + json.enable)
        console.log(json);
        localStorage.setItem("BruteForceTab", JSON.stringify(json));
    }

    render() {
        return (
            <div>
                <Header as="h3">Brute Force</Header>
                <Grid  >
                    <Grid.Row textAlign="right">
                        <Grid.Column>
                            <Checkbox id="A" checked={this.state.setUpVisible} label="Enable" toggle onClick={(e, d) => this._checkBoxAction(e, d)} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Divider inverted />
                {this.state.error && (
                    <Message info
                        icon="warning circle"
                        header={this.state.errorHeader}
                        content={this.state.error}
                    />
                )}
                {this.state.setUpVisible ?
                    <Body /> :
                    null
                }
            </div>
        )
    }
}
class Body extends Component {

    constructor(props) {
        super(props);

        this.state = {
            xpathFormVisible: true,
            pswFormVisible: true
        }
    }

    componentWillMount() {
        this.idLoginFormXPathExpr = newId();
        this.idLoginNameXPathExpr = newId();
        this.idLoginpswXPathExpr = newId();
        this.idLoginNames = newId();
        this.idLoginPsw = newId();
    }

    componentDidMount() {
        var json = readStorage();
        document.getElementById(this.idLoginFormXPathExpr).value = json.data.idLoginFormXPathExpr;
        document.getElementById(this.idLoginNames).value = json.data.idLoginNames;
        document.getElementById(this.idLoginPsw).value = json.data.idLoginPsw;
        document.getElementById(this.idLoginFormLocation).value = json.data.idLoginFormLocation;
    }

    componentWillUnmount() {
        var json = readStorage();
        json.data.idLoginFormXPathExpr = document.getElementById(this.idLoginFormXPathExpr).value;
        json.data.idLoginNames = document.getElementById(this.idLoginNames).value;
        json.data.idLoginPsw = document.getElementById(this.idLoginPsw).value;
        json.data.idLoginFormLocation = document.getElementById(this.idLoginFormLocation).value;
        localStorage.setItem("BruteForceTab", JSON.stringify(json));
    }

    _switchAutomaticallyXPath() {
        this.setState({ xpathFormVisible: !this.state.xpathFormVisible });
    }

    _switchAutomaticallyDatabase() {
        this.setState({ pswFormVisible: !this.state.pswFormVisible });
    }

    render() {
        return (
            <div>
                <Form>
                    <Header as="h5">Login form XPath expression</Header>
                    <TextArea id={this.idLoginFormXPathExpr} placeholder="Tell us more" disabled={this.state.xpathFormVisible} />
                </Form>
                <Divider hidden />
                <Form >
                    <Header as="h5">Input name XPath expression</Header>
                    <TextArea id={this.idLoginNameXPathExpr} placeholder="Tell us more" disabled={this.state.xpathFormVisible} />
                </Form>
                <Divider hidden />
                <Form >
                    <Header as="h5">Input password XPath expression</Header>
                    <TextArea id={this.idLoginpswXPathExpr} placeholder="Tell us more" disabled={this.state.xpathFormVisible} />
                </Form>
                <Divider hidden />

                <Grid  >
                    <Grid.Row textAlign="right">
                        <Grid.Column>
                            <Checkbox checked={this.state.xpathFormVisible} label={{ children: 'Automatically' }} onClick={() => this._switchAutomaticallyXPath()} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid divided="vertically">
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <Form >
                                <Header as="h5">Login names</Header>
                                <TextArea id={this.idLoginNames} placeholder="Tell us more" disabled={this.state.pswFormVisible} />
                            </Form>
                        </Grid.Column>
                        <Grid.Column>
                            <Form >
                                <Header as="h5">Passwords</Header>
                                <TextArea id={this.idLoginPsw} placeholder="Tell us more" disabled={this.state.pswFormVisible} />
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid  >
                    <Grid.Row textAlign="right">
                        <Grid.Column>
                            <Checkbox label={{ children: 'Use database' }} onClick={() => this._switchAutomaticallyXPath()} disabled={this.state.pswFormVisible} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}