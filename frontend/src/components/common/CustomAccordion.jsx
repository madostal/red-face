import React from 'react'
import PropTypes from 'prop-types'
import {
	Accordion,
	Grid,
	Icon,
} from 'semantic-ui-react'

export default class CustomAccordion extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			isOpen: !true,
		}
	}

	render = () => {
		return (
			<div>
				<Accordion exclusive={false} defaultActiveIndex={[0]}>
					<Accordion.Title active={this.state.isOpen} onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
						<Grid columns='equal' reversed='computer'>
							<Grid.Row>
								<Grid.Column textAlign='right'>
									{
										((() => {
											if (!this.state.isOpen) {
												return <span>HIDE <Icon name='chevron down' /></span>
											} else {
												return <span>SHOW <Icon name='chevron up' /></span>
											}
										})())
									}
								</Grid.Column>
								<Grid.Column textAlign='left'>
									{this.props.header}
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</Accordion.Title>
					<Accordion.Content >
						{this.props.content}
					</Accordion.Content>
				</Accordion>
			</div>
		)
	}
}

CustomAccordion.propTypes = {
	content: PropTypes.element.isRequired,
	header: PropTypes.element.isRequired,
}