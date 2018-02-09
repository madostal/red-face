import React from 'react'
import PropTypes from 'prop-types'
import HeaderMenu from 'common/menu/HeaderMenu'
import Footer from 'common/Footer'
import '../styles/userstyles.css'
import '../images/fav.ico'

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
				<Footer />
			</div>
		)
	}
}

App.propTypes = {
	children: PropTypes.element.isRequired,
}