import React, { Component } from "react"
import {
    Header,
    Checkbox,
    Form,
    TextArea,
    Segment,
    Divider,
    Grid,
    Message, Input
} from "semantic-ui-react"

import newId from "../../../utils/Newid";

import { TASK_DISABLE_WARNING_MESSAGE, TASK_DISABLE_WARNING_MESSAGE_HEADER } from "../../../language/Variables"

const defaultXPathForm = "a";
const defaultXPathFormInput = "b";
const defaultXPathFormPsw = "c";

function createStorageIfNotExist() {
    var json = JSON.stringify({
        "enable": false,
        data: {
            "idXpathFormDefault": true,
            "idLoginFormXPathExpr": defaultXPathForm,
            "idLoginNameXPathExpr": defaultXPathFormInput,
            "idLoginpswXPathExpr": defaultXPathFormPsw,
            "idLoginNamesDefault": true,
            "idLoginNames": "",
            "idLoginPsw": "",
            "idUrlLocation": ""
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
        };
    }

    _checkBoxAction(e, d) {
        var json = readStorage();

        json.enable = !d.checked;
        if (d.checked) {
            this.setState({ error: TASK_DISABLE_WARNING_MESSAGE });
            this.setState({ setUpVisible: false });
        } else {
            this.setState({ error: undefined });
            this.setState({ setUpVisible: true });
        }
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
        this.idLoginFormCheckbox = newId();

        this.idLoginNames = newId();
        this.idLoginPsw = newId();
        this.idLoginNamesCheckbox = newId();

        this.idUrlLocation = newId();
    }

    componentDidMount() {
        var json = readStorage();
        this.state = ({ xpathFormVisible: json.data.idXpathFormDefault });
        document.getElementById(this.idLoginFormCheckbox).firstChild.checked = json.data.idXpathFormDefault;
        document.getElementById(this.idLoginFormXPathExpr).value = json.data.idLoginFormXPathExpr;
        document.getElementById(this.idLoginNameXPathExpr).value = json.data.idLoginNameXPathExpr;
        document.getElementById(this.idLoginpswXPathExpr).value = json.data.idLoginpswXPathExpr;

        this.state = ({ pswFormVisible: json.data.idLoginNamesDefault });
        document.getElementById(this.idLoginNamesCheckbox).firstChild.checked = json.data.idLoginNamesDefault;
        document.getElementById(this.idLoginNames).value = json.data.idLoginNames.join("\r\n");
        document.getElementById(this.idLoginPsw).value = json.data.idLoginPsw.join("\r\n");

        document.getElementById(this.idUrlLocation).value = json.data.idUrlLocation;
    }

    componentWillUnmount() {
        var json = readStorage();
        var tmpLoginFormCheckbox = document.getElementById(this.idLoginFormCheckbox).firstChild.checked;
        json.data.idXpathFormDefault = tmpLoginFormCheckbox;
        json.data.idLoginFormXPathExpr = (tmpLoginFormCheckbox ? defaultXPathForm : document.getElementById(this.idLoginFormXPathExpr).value);
        json.data.idLoginNameXPathExpr = (tmpLoginFormCheckbox ? defaultXPathFormInput : document.getElementById(this.idLoginNameXPathExpr).value);
        json.data.idLoginpswXPathExpr = (tmpLoginFormCheckbox ? defaultXPathFormPsw : document.getElementById(this.idLoginpswXPathExpr).value);

        if (!document.getElementById(this.idLoginNamesCheckbox).firstChild.checked) {
            json.data.idLoginNamesDefault = true;
            json.data.idLoginNames = document.getElementById(this.idLoginNames).value.split(/\s/);
            json.data.idLoginPsw = document.getElementById(this.idLoginPsw).value.split(/\s/);
        } else {
            json.data.idLoginNamesDefault = false;
        }
        json.data.idUrlLocation = document.getElementById(this.idUrlLocation).value;
        localStorage.setItem("BruteForceTab", JSON.stringify(json));
    }

    _switchAutomaticallyXPath() {
        this.setState({ xpathFormVisible: !this.state.xpathFormVisible });
        if (!this.state.xpathFormVisible) {
            document.getElementById(this.idLoginFormXPathExpr).value = defaultXPathForm;
            document.getElementById(this.idLoginNameXPathExpr).value = defaultXPathFormInput;
            document.getElementById(this.idLoginpswXPathExpr).value = defaultXPathFormPsw;
        }
    }

    _switchAutomaticallyDatabase() {
        this.setState({ pswFormVisible: !this.state.pswFormVisible });
        if (!this.state.pswFormVisible) {
            document.getElementById(this.idLoginNames).value = "";
            document.getElementById(this.idLoginPsw).value = "";
        }
    }

    render() {
        return (
            <div>
                <Form >
                    <Header as="h5">Login form XPath expression</Header>
                    <TextArea id={this.idLoginFormXPathExpr} placeholder="Specify login form XPath expression" disabled={this.state.xpathFormVisible} />
                </Form>
                <Divider hidden />
                <Form >
                    <Header as="h5">Input name XPath expression</Header>
                    <TextArea id={this.idLoginNameXPathExpr} placeholder="Specify input name XPath expression" disabled={this.state.xpathFormVisible} />
                </Form>
                <Divider hidden />
                <Form >
                    <Header as="h5">Input password XPath expression</Header>
                    <TextArea id={this.idLoginpswXPathExpr} placeholder="Specify input password XPath expression" disabled={this.state.xpathFormVisible} />
                </Form>
                <Divider hidden />

                <Grid  >
                    <Grid.Row textAlign="right">
                        <Grid.Column>
                            <Checkbox id={this.idLoginFormCheckbox} checked={this.state.xpathFormVisible} label={{ children: "Automatically" }} onClick={() => this._switchAutomaticallyXPath()} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid divided="vertically">
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <Form >
                                <Header as="h5">Login names</Header>
                                <TextArea id={this.idLoginNames} placeholder="Login names" disabled={this.state.pswFormVisible} />
                            </Form>
                        </Grid.Column>
                        <Grid.Column>
                            <Form >
                                <Header as="h5">Passwords</Header>
                                <TextArea id={this.idLoginPsw} placeholder="Passwords" disabled={this.state.pswFormVisible} />
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid  >
                    <Grid.Row textAlign="right">
                        <Grid.Column>
                            <Checkbox id={this.idLoginNamesCheckbox} checked={this.state.pswFormVisible} label={{ children: "Use database" }} onClick={() => this._switchAutomaticallyDatabase()} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Form >
                    <Header as="h5">URL location</Header>
                    <Input id={this.idUrlLocation} placeholder="Specify url where is form located" fluid />
                </Form>
                <Divider hidden />
            </div>
        )
    }
}