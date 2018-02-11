import React from 'react'
import PropTypes from 'prop-types'
import {
	Header,
	Checkbox,
	Form,
	TextArea,
	Divider,
	Grid,
	Input,
} from 'semantic-ui-react'
import BodyParent from './BodyParent'

export default class BruteForceTab extends BodyParent {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (

			<Form >
				<Header as="h5">Login form XPath expression</Header>
				<TextArea
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					id={'loginFormXPathExpr'}
					value={this.props.data.data.loginFormXPathExpr}
					placeholder="Specify login form XPath expression"
					disabled={this.props.data.data.useDefaulXPath}
				/>

				<Divider hidden />

				<Header as="h5">Input name XPath expression</Header>
				<TextArea
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					id={'loginNameXPathExpr'}
					value={this.props.data.data.loginNameXPathExpr}
					placeholder="Specify input name XPath expression"
					disabled={this.props.data.data.useDefaulXPath}
				/>

				<Divider hidden />

				<Header as="h5">Input password XPath expression</Header>
				<TextArea
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					id={'loginPswXPathExpr'}
					value={this.props.data.data.loginPswXPathExpr}
					placeholder="Specify input password XPath expression"
					disabled={this.props.data.data.useDefaulXPath}
				/>

				<Divider hidden />

				<Grid >
					<Grid.Row textAlign="right">
						<Grid.Column>
							<Checkbox
								onChange={(d, e) => this._componentOnChangeCheck(d, e)}
								id={'useDefaulXPath'}
								checked={this.props.data.data.useDefaulXPath}
								label={{ children: 'Automatically' }}
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Grid divided="vertically">
					<Grid.Row columns={2}>
						<Grid.Column>

							<Header as="h5">Login names</Header>
							<TextArea
								onChange={(d, e) => this._componentOnChangeText(d, e)}
								id={'loginNames'}
								value={this.props.data.data.loginNames}
								placeholder="Login names"
								disabled={this.props.data.data.useLoginNamesDefault}
							/>

						</Grid.Column>
						<Grid.Column>

							<Header as="h5">Passwords</Header>
							<TextArea
								onChange={(d, e) => this._componentOnChangeText(d, e)}
								id={'loginPsws'}
								value={this.props.data.data.loginPsws}
								placeholder="Passwords"
								disabled={this.props.data.data.useLoginNamesDefault}
							/>

						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Grid >
					<Grid.Row textAlign="right">
						<Grid.Column>
							<Checkbox
								onChange={(d, e) => this._componentOnChangeCheck(d, e)}
								id={'useLoginNamesDefault'}
								checked={this.props.data.data.useLoginNamesDefault}
								label={{ children: 'Use database' }}
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>

				<Header as="h5">URL location</Header>
				<Grid >
					<Grid.Row>
						<Grid.Column>
							<Input
								onChange={(d, e) => this._componentOnChangeText(d, e)}
								id={'location'} value={this.props.data.data.location}
								placeholder="Specify url where is form located"
								fluid
								disabled={this.props.data.data.locationAuto}
							/>
						</Grid.Column>
					</Grid.Row>
					<Grid.Row>
						<Grid.Column textAlign="right">
							<Checkbox
								onChange={(d, e) => this._componentOnChangeCheck(d, e)}
								id={'locationAuto'}
								checked={this.props.data.data.locationAuto}
								label={{ children: 'Automatically find login form' }}
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>

				<Header as="h5">Parallel nodes</Header>
				<Input
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					id={'nodes'}
					value={this.props.data.data.nodes}
					placeholder="Specify how many nodes do you want use"
					fluid
				/>
				<Header as="h5">Page percentage difference</Header>
				<Input
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					id={'percentageDiff'}
					value={this.props.data.data.percentageDiff}
					placeholder="Specify percentage difference between wrong password page and logged in home page"
					fluid
				/>

				<Divider hidden />
			</Form>
		)
	}
}

BruteForceTab.propTypes = {
	data: PropTypes.object.isRequired,
}