import React, { Component } from "react"

import {
    Sidebar,
    Segment,
    Button,
    Menu,
    Image,
    Icon,
    Header
} from "semantic-ui-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";


export default class Footer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            toast: "info"
        }

        this._handleSocket = this._handleSocket.bind(this);
        this._handleSocket();

        this._toastInfo = this._toastInfo.bind(this);
        this._toastSuccess = this._toastSuccess.bind(this);
    }


    _toastInfo(body) {
        this.state.toast = "info";
        toast.info(body);
    }

    _toastSuccess(body) {
        this.state.toast = "success";
        toast.success(body);
    }

    _handleSocket() {

        this.props.socket.on("connect_error", function () {
            this.setState({ visible: true });
        }.bind(this));

        this.props.socket.on("connect", function () {
            this.setState({ visible: false })
        }.bind(this));

        this.props.socket.on("taskcreate", function (data) {
            this._toastInfo("The task " + data + " was scheduled");
        }.bind(this));

        this.props.socket.on("taskdone", function (data) {
            this._toastSuccess("Task done");
        }.bind(this));

        this.props.socket.on("taskstart", function (data) {
            this._toastInfo("Task start");
        }.bind(this));
    }

    render() {
        return (
            <div className="create-task-section">
                <Sidebar as={Menu} animation="overlay" direction="bottom" visible={this.state.visible} inverted>
                    <Menu.Item name="home">
                        <Icon name="power cord" />
                        We are sorry, it"s seems that server is down
                </Menu.Item>
                </Sidebar>
                <ToastContainer
                    position="bottom-left"
                    type={this.state.toast}
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                />
            </div>
        );
    }
}
