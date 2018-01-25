import React from 'react'
import PropTypes from 'prop-types'
import {
	Popup,
	Icon,
} from 'semantic-ui-react'

export default class Helper extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<Popup
					position='top right'
					key={this.props.header}
					trigger={<Icon size='large' name='help circle outline' />}
					header={this.props.header}
					content={this.props.content}
				/>
			</div>
		)
	}
}

Helper.propTypes = {
	header: PropTypes.string.isRequired,
	content: PropTypes.string.isRequired,
}