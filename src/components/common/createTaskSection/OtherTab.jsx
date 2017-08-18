import React, { Component } from "react"
import {
    Header,
    Checkbox,
    Input,
    Form,
    TextArea,
    Segment,
    Divider,
    Grid,
    Image,
    Message
} from "semantic-ui-react"

import newId from "../../../utils/Newid";

import { TASK_DISABLE_WARNING_MESSAGE, TASK_DISABLE_WARNING_MESSAGE_HEADER } from "../../../language/Variables"

function createStorageIfNotExist() {
    var json = JSON.stringify({
        "enable": false,
        data: {
            "idTestJavascriptImport": false,
            "idTestHttpHttps": false,
            "idTestGitConfig": false
        }
    });
    localStorage.setItem("OtherTab", json);
    return json;
}

function readStorage() {
    return JSON.parse(localStorage.getItem("OtherTab"));
}

export default class OtherTab extends Component {

    constructor(props) {
        super(props)
        var storage;
        if (localStorage.getItem("OtherTab") === null) {
            storage = createStorageIfNotExist();
        } else {
            storage = readStorage();
        }
        var isEnable = storage.enable === true;
        this.state = {
            errorHeader: TASK_DISABLE_WARNING_MESSAGE_HEADER,
            error: (!isEnable) ? TASK_DISABLE_WARNING_MESSAGE : undefined,
            setUpVisible: isEnable
        }
    }

    _checkBoxAction(e, d) {
        var json = readStorage();
        if (d.checked) {
            this.setState({ error: TASK_DISABLE_WARNING_MESSAGE })
            this.setState({ setUpVisible: false })
            json.enable = false;
        } else {
            this.setState({ error: undefined })
            this.setState({ setUpVisible: true })
            json.enable = true;
        }
        localStorage.setItem("OtherTab", JSON.stringify(json));
    }

    render() {
        let { error } = this.state
        return (
            <div>
                <div>
                    <Header as="h3">Other</Header>
                    <Grid  >
                        <Grid.Row textAlign="right">
                            <Grid.Column>
                                <Checkbox checked={this.state.setUpVisible} label="Enable" toggle onClick={(e, d) => this._checkBoxAction(e, d)} />
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
            </div>
        )
    }
}

class Body extends Component {

    componentWillMount() {
        this.idTestJavascriptImport = newId();
        this.idTestHttpHttps = newId();
        this.idTestGitConfig = newId();
    }

    componentDidMount() {
        var json = readStorage();
        document.getElementById(this.idTestJavascriptImport).getElementsByTagName("input")[0].checked = json.data.idTestJavascriptImport;
        document.getElementById(this.idTestHttpHttps).getElementsByTagName("input")[0].checked = json.data.idTestHttpHttps;
        document.getElementById(this.idTestGitConfig).getElementsByTagName("input")[0].checked = json.data.idTestGitConfig;
    }

    componentWillUnmount() {
        var json = readStorage();
        json.data.idTestJavascriptImport = document.getElementById(this.idTestJavascriptImport).getElementsByTagName("input")[0].checked;
        json.data.idTestHttpHttps = document.getElementById(this.idTestHttpHttps).getElementsByTagName("input")[0].checked;
        json.data.idTestGitConfig = document.getElementById(this.idTestGitConfig).getElementsByTagName("input")[0].checked;
        localStorage.setItem("OtherTab", JSON.stringify(json));
    }

    render() {
        return (
            < div >
                <Checkbox id={this.idTestJavascriptImport} label={<label>Test javascript import</label>} />
                <Divider hidden />
                <Checkbox id={this.idTestHttpHttps} label={<label>Test http and https</label>} />
                <Divider hidden />
                <Checkbox id={this.idTestGitConfig} label={<label>Test GIT config</label>} />
                <Divider hidden />
                <Divider hidden />
            </div >
        )
    }
}