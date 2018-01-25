import React from 'react'
import PropTypes from 'prop-types'
import {
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	BarChart,
	Bar,
} from 'recharts'

export default class TaskStatusRepresentation extends React.Component {

	render = () => {
		return (
			<ResponsiveContainer width='100%' height={224} >
				<BarChart
					width={600}
					height={300}
					data={this.props.data}
					layout="vertical"
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<XAxis type="number" />
					<YAxis type="category" dataKey="name" />
					<CartesianGrid strokeDasharray="3 3" />
					<Bar dataKey="number" fill="#4026e5" />
				</BarChart>
			</ResponsiveContainer>
		)
	}
}

TaskStatusRepresentation.propTypes = {
	data: PropTypes.array.isRequired,
}