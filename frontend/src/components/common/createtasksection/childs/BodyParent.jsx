import React from 'react'
import PropTypes from 'prop-types'

export default class BodyParent extends React.Component {

	constructor(props) {
		super(props)
	}

	_getParentName = () => {
		return this.props.name
	}

	_sendToGrandParent = (id, val, parentName) => {
		this.props.storeFn(id, val, parentName, true)
	}

	_componentOnChangeTextArr = (d, e) => {
		let val = e.value.split('\n')

		this.setState({
			[e.id]: val,
		})
		this._sendToGrandParent(e.id, val, this._getParentName())
	}

	_componentOnChangeText = (d, e) => {
		this.setState({
			[e.id]: e.value,
		})
		this._sendToGrandParent(e.id, e.value, this._getParentName())
	}

	_componentOnChangeCheck = (d, e) => {
		this.setState({
			[e.id]: e.checked,
		})
		this._sendToGrandParent(e.id, e.checked, this._getParentName())
	}

}

BodyParent.propTypes = {
	storeFn: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
}