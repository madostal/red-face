import React from 'react'
import PropTypes from 'prop-types'
import {
	Checkbox,
	Input,
	Divider,
} from 'semantic-ui-react'
import BodyParent from './BodyParent'

export default class OtherTab extends BodyParent {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			< div >
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testFormActionHijacking}
					id={'testFormActionHijacking'}
					label={<label>Form action hijacking</label>}
				/>
				<Divider hidden />
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testJavascriptImport}
					id={'testJavascriptImport'}
					label={<label>Test inline JS</label>}
				/>
				<Divider hidden />
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testHttpHttps}
					id={'testHttpHttps'}
					label={<label>Test http and https</label>}
				/>
				<Divider hidden />
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testCrossOriginReq}
					id={'testCrossOriginReq'}
					label={<label>Cross-Origin request</label>}
				/>
				<Divider hidden />
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testGitConfig}
					id={'testGitConfig'}
					label={<label>Test GIT config</label>}
				/>
				<Input
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					value={this.props.data.data.testGitConfigPpst}
					id={'testGitConfigPpst'}
					placeholder="Page percentage difference"
					disabled={!this.props.data.data.testGitConfig}
				/>
				<Divider hidden />
				<Checkbox
					onChange={(d, e) => this._componentOnChangeCheck(d, e)}
					checked={this.props.data.data.testPortScan}
					id={'testPortScan'}
					label={<label>Port scanner</label>}
				/>
				<Input
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					value={this.props.data.data.testPortScanDataFrom}
					id={'testPortScanDataFrom'}
					placeholder="From"
					disabled={!this.props.data.data.testPortScan}
				/>
				<Input
					onChange={(d, e) => this._componentOnChangeText(d, e)}
					value={this.props.data.data.testPortScanDataTo}
					id={'testPortScanDataTo'}
					placeholder="To"
					disabled={!this.props.data.data.testPortScan}
				/>
				<Divider hidden />
				<Divider hidden />
			</div >
		)
	}
}

OtherTab.propTypes = {
	data: PropTypes.object.isRequired,
}