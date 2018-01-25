import React from 'react'
import CpuGraph from './../common/graph/CpuGraph'

export default class SystemPage extends React.Component {

	constructor(props) {
		super(props)
	}

	render = () => {
		return (
			<div>
				<CpuGraph />
			</div>
		)
	}
}
