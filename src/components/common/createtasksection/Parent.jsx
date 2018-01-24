import React from 'react'
import PropTypes from 'prop-types'
import {
	Header,
	Checkbox,
	Divider,
	Grid,
} from 'semantic-ui-react'
import DisableTaskMessage from './../messages/DisableTaskMessage'

export default class Parent extends React.Component {

	constructor(props) {
		super(props)
	}

	_checkBoxAction = () => {
		this.props.storeFn('enable', !this.props.isEnable, this.props.name)
	}

	render = () => {
		return (
			<div>
				<Header as="h3">{this.props.header}</Header>
				<Grid >
					<Grid.Row textAlign="right">
						<Grid.Column>
							<Checkbox
								checked={this.props.isEnable}
								label="Enable"
								toggle
								onClick={(e, d) => this._checkBoxAction(e, d)}
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Divider inverted />

				{this.props.isEnable
					? this.props.child
					: <DisableTaskMessage />
				}
			</div>
		)
	}
}

Parent.propTypes = {
	isEnable: PropTypes.bool.isRequired,
	name: PropTypes.string.isRequired,
	header: PropTypes.string.isRequired,
	storeFn: PropTypes.func.isRequired,
	child: PropTypes.element.isRequired,
}