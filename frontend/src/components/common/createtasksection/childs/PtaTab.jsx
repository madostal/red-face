import React from 'react'
import PropTypes from 'prop-types'
import {
	Header,
	TextArea,
	Form,
} from 'semantic-ui-react'
import BodyParent from './BodyParent'

export default class PtaTab extends BodyParent {

	render = () => {
		return (
			<div>
				<Form>
					<Header as="h5">Configuration</Header>
					<TextArea
						onChange={(d, e) => this._componentOnChangeText(d, e)}
						id={'userData'}
						value={Array.isArray(this.props.data.data.userData) ? this.props.data.data.userData.join('\n') : this.props.data.data.userData}
						placeholder="xxx"
					/>
				</Form>
			</div>
		)
	}
}

PtaTab.propTypes = {
	data: PropTypes.object.isRequired,
}