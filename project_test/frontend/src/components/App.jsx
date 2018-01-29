import React from 'react'
import PropTypes from 'prop-types'
import HeaderMenu from 'common/HeaderMenu'
import Footer from 'common/Footer'
import {
	Table,
	Grid,
	Segment,
	Button,
	Header,
	Menu,
	Icon,
	Divider,
	Statistic,
	Input,
} from 'semantic-ui-react'
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
				<Grid container style={{ padding: '1.5em 1.5em' }} as={Segment}>
					<Grid.Row>
						<Grid.Column>
							<Grid columns={1} divided>
								<Grid.Row>
									<Grid.Column>
										{this.props.children}

									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Footer />
			</div>
		)
	}
}

App.propTypes = {
	children: PropTypes.element.isRequired,
}