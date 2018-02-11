import React from 'react'
import PropTypes from 'prop-types'
import {
	Icon,
	Loader,
} from 'semantic-ui-react'

export default class State extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		const { state } = this.props
		return (
			<div className="app">
				{
					((() => {
						switch (state) {
							case 0:
								return <Icon name="wait" size="large" />
							case 1:
								return <Loader active inline size="small" />
							case 2:
								return <Icon name="checkmark" size="large" />
							case 3:
								return <Icon name="exclamation triangle" size="large" />
							case 4:
								return <Icon name="crosshairs" size="large" />
							default:
								return null
						}
					})())
				}
			</div>
		)
	}
}

State.propTypes = {
	state: PropTypes.number.isRequired,
}