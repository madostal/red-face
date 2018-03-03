import React from 'react'
import PropTypes from 'prop-types'
import {
	Header,
	TextArea,
	Divider,
	Checkbox,
	Grrid,
	Grid,
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
						onChange={(d, e) => this._componentOnChangeTextArr(d, e)}
						id={'userSettings'}
						value={Array.isArray(this.props.data.data.userSettings) ? this.props.data.data.userSettings.join('\n') : this.props.data.data.userSettings}
						placeholder="Configuration"
						disabled={this.props.data.data.useDefault}
					/>
				</Form>
				<Divider hidden />

				<Grid>
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
			</div>
		)
	}
}

PtaTab.propTypes = {
	data: PropTypes.object.isRequired,
}