import React from 'react'
import PropTypes from 'prop-types'
import {
	XAxis,
	YAxis,
	CartesianGrid,
	AreaChart,
	Area,
	ResponsiveContainer,
} from 'recharts'

export default class CpuGraph extends React.Component {

	render = () => {
		return (
			<ResponsiveContainer width='100%' height={250} >
				<AreaChart width={730} height={250} data={this.props.data}
					margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#4026e5" stopOpacity={0.8} />
							<stop offset="95%" stopColor="#4026e0" stopOpacity={0} />
						</linearGradient>
					</defs>
					<XAxis dataKey="name" tickFormatter={(val) => { return [val, 's'].join('') }} />
					<YAxis domain={[0, 100]} allowDecimals={false} tickFormatter={(val) => { return [val, '%'].join('') }} />
					<CartesianGrid strokeDasharray="3 3" />
					<Area type="monotone" dataKey="cpu" stroke="#8884d8" fillOpacity={1} fill="url(#cpu)" />
				</AreaChart>
			</ResponsiveContainer>
		)
	}
}

CpuGraph.propTypes = {
	data: PropTypes.array.isRequired,
}