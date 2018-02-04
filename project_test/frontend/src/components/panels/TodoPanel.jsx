import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import {
	Button,
	Icon,
} from 'semantic-ui-react'

export default class TodoPanel extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		const { id, remove } = this.props
		return (
			<span>
				<Button
					color='blue'
					icon
					size='mini'
					as={Link}
					to={['/detail?id=', id].join('')}
				>
					<Icon name='eye' />
				</Button>
				<Button
					color='red'
					icon
					size='mini'
					onClick={() => remove(id)}
				>
					<Icon name='delete' />
				</Button>
			</span>
		)
	}
}

TodoPanel.propTypes = {
	remove: PropTypes.func.isRequired,
	id: PropTypes.number.isRequired,
}