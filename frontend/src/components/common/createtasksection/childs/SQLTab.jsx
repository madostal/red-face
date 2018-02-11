import React from 'react'
import PropTypes from 'prop-types'
import {
	Header,
	Checkbox,
	Form,
	TextArea,
	Divider,
	Grid,
} from 'semantic-ui-react'
import BodyParent from './BodyParent'

export default class SQLTab extends BodyParent {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testParams}
					id={'testParams'}
					label={<label>testParams</label>}
				/>
				<Divider hidden />
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testForms}
					id={'testForms'}
					label={<label>testForms</label>}
				/>
			</div>
		)
	}
}

SQLTab.propTypes = {
	data: PropTypes.object.isRequired,
}