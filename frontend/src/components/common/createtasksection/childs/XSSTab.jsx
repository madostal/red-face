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

export default class XSSTab extends BodyParent {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<Form >
					<Header as="h5">Input XSS attack (is checked by alert)</Header>
					<TextArea
						onChange={(d, e) => this._componentOnChangeTextArr(d, e)}
						id={'userSettings'}
						value={Array.isArray(this.props.data.data.userSettings) ? this.props.data.data.userSettings.join('\n') : this.props.data.data.userSettings}
						placeholder="Specify input password XPath expression"
						disabled={this.props.data.data.useDefault}
					/>
				</Form>
				<Divider hidden />

				<Grid >
					<Grid.Row textAlign="right">
						<Grid.Column>
							<Checkbox
								onChange={(d, e) => this._componentOnChangeCheck(d, e)}
								id={'useDefault'}
								checked={this.props.data.data.useDefault}
								label={{ children: 'Use default' }}
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>

				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testParams}
					id={'testParams'}
					label={<label>Test url params</label>}
				/>
				<Divider hidden />
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testForms}
					id={'testForms'}
					label={<label>Test page forms</label>}
				/>

			</div>
		)
	}
}

XSSTab.propTypes = {
	data: PropTypes.object.isRequired,
}