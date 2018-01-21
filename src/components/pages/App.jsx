import React from 'react'
import HeaderMenu from 'common/HeaderMenu'
import Footer from 'common/Footer'
import '../../styles/userstyles.css'
import '../../images/fav.ico'
import Api from 'utils/Api'

export default class App extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div className="app">
				<HeaderMenu />
				<div className="app-view-container ui container">
					{this.props.children}
				</div>
				<Footer socket={Api.getSocket()} />
			</div>
		)
	}
}
