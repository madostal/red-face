import React, { Component } from 'react'
import { Link } from 'react-router'
import {
  Menu,
  Icon
} from 'semantic-ui-react'

import Footer from 'common/Footer'

import '../../styles/userstyles.css'
import '../../images/fav.ico'

import Api from 'utils/Api'

export default class App extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    const path = this.props.location.pathname

    return (
      <div className='app'>
        <Menu fixed='top' inverted>
          <div className='ui container'>
            <Menu.Item active={(path === '/home' || path === '/')} as={Link} to='/home'>
              <Icon name='home' /> Home
            </Menu.Item>
            <Menu.Item active={(path === '/items')} as={Link} to='/items'>
              <Icon name='list' /> Items
            </Menu.Item>
            <Menu.Menu position='right'  >
              <Menu.Item active={(path === '/create-task')} as={Link} to='/create-task'>
                <Icon name='plus' /> Create task
            </Menu.Item>
            </Menu.Menu>
          </div>
        </Menu>
        <div className='app-view-container ui container'>
          {this.props.children}
        </div>
        <Footer socket={Api.getSocket()} />
      </div>
    )
  }
}
