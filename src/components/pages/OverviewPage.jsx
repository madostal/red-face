import React from 'react'
import OverviewTable from 'common/overviewSection/OverviewTable'

export default class OverviewPage extends React.Component {

	render = () => {
		return (
			<div className="home-section">
				<OverviewTable />
			</div>
		)
	}
}