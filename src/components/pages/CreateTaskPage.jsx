import React from 'react'
import {
	Tab,
	Segment,
	Grid,
	Button,
	Header,
	Input,
	Divider,
	TextArea,
	Form,
} from 'semantic-ui-react'
import { browserHistory } from 'react-router'
import Helper from '../common/popup/Helper'
import Api from 'utils/Api'

import Parent from './../common/createTaskSection/Parent'

import BruteForceTab from './../common/createTaskSection/childs/BruteForceTab'
import XSSTab from './../common/createTaskSection/childs/XSSTab'
import OtherTab from './../common/createTaskSection/childs/OtherTab'

const defaultXPathForm = '//form//input[@type=\'text\' or @type=\'email\']//ancestor::form//input[@type=\'password\']//ancestor::form'
const defaultXPathFormInput = ['(', [defaultXPathForm, '//input'].join(''), ')[1]'].join('')
const defaultXPathFormPsw = ['(', [defaultXPathForm, '//input'].join(''), ')[2]'].join('')

const DEFAULT_XSS = [
	'\'\">><marquee><img src=x onerror=confirm(1)></marquee>\"></plaintext\></|\><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>\'-->\"></script><script>alert(document.cookie)</script>\"><img/id=\"confirm&lpar;1)\"/alt=\"/\"src=\"/\"onerror=eval(id)>\'\"><img src=\"http://www.shellypalmer.com/wp-content/images/2015/07/hacked-compressor.jpg\">',
	'second',
]

const DEFAULT_CRAWLER_DEEP = 10

const BRUTE_FORCE_BOOL = {
	enable: { enable: true },
	useDefaulXPath: {
		loginFormXPathExpr: defaultXPathForm,
		loginNameXPathExpr: defaultXPathFormInput,
		loginPswXPathExpr: defaultXPathFormPsw,
	},
	useLoginNamesDefault: {
		loginNames: '',
		loginPsws: '',
	}
}

const XSS_BOOL = {
	useDefault: {
		userSettings: DEFAULT_XSS,
	},
}

const GLOBAL_DATA = {
	bruteforcetab: BRUTE_FORCE_BOOL,
	xsstab: XSS_BOOL,
}

const restarter = (flagName, type) => {
	if (GLOBAL_DATA[type]) {
		if (GLOBAL_DATA[type][flagName]) {
			return GLOBAL_DATA[type][flagName]
		}
	}
	return
}

const createDefaultStore = () => {
	let obj = {
		taskname: '',
		serverHome: '',
		crawlerisneed: false,
		crawlerdeep: DEFAULT_CRAWLER_DEEP,
		taskdata: {
			bruteforcetab: {},
			othertab: {},
			xsstab: {},
			sqltab: {},
		},
	}

	//bruteforce
	obj.taskdata.bruteforcetab.data = {}
	obj.taskdata.bruteforcetab.data.enable = false
	obj.taskdata.bruteforcetab.data.useDefaulXPath = true
	obj.taskdata.bruteforcetab.data.loginFormXPathExpr = defaultXPathForm
	obj.taskdata.bruteforcetab.data.loginNameXPathExpr = defaultXPathFormInput
	obj.taskdata.bruteforcetab.data.loginPswXPathExpr = defaultXPathFormPsw
	obj.taskdata.bruteforcetab.data.useLoginNamesDefault = true
	obj.taskdata.bruteforcetab.data.loginNames = ''
	obj.taskdata.bruteforcetab.data.loginPsws = ''
	obj.taskdata.bruteforcetab.data.location = '/'
	obj.taskdata.bruteforcetab.data.nodes = '2'

	//xss
	obj.taskdata.xsstab.data = {}
	obj.taskdata.xsstab.data.enable = false
	obj.taskdata.xsstab.data.userSettings = DEFAULT_XSS
	obj.taskdata.xsstab.data.useDefault = true

	//other
	obj.taskdata.othertab.data = {}
	obj.taskdata.othertab.data.enable = false
	obj.taskdata.othertab.data.testJavascriptImport = true
	obj.taskdata.othertab.data.testHttpHttps = true
	obj.taskdata.othertab.data.testGitConfig = true
	obj.taskdata.othertab.data.testPortScan = true
	obj.taskdata.othertab.data.testPortScanDataFrom = 1
	obj.taskdata.othertab.data.testPortScanDataTo = 1000
	return obj
}

const LOCAL_STORAGE_NAME = 'config'

export default class CrreateTaskPage extends React.Component {

	constructor(props) {
		super(props)
		let conf = JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAME))

		if (!conf) {
			conf = createDefaultStore()
		}
		console.log('Constructor')
		console.log(conf)
		this.state = conf
	}

	_componentOnChangeText = (d, e) => {
		//because set state is async
		let tmp = this.state
		tmp[e.id] = e.value

		this.setState({
			[e.id]: e.value,
		})
		console.log(this.state)
		localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(tmp))
	}

	_createTask = () => {
		console.log(this.state)
		let home = this.state.serverHome.split(/\r?\n/)
		if (home.length > 1) {
			//more the one task
			let stateTmp = this.state
			let iterator = 1
			home.forEach(el => {
				let toSend = stateTmp
				toSend.serverHome = el
				toSend.taskname = [toSend.taskname, ' ', iterator, '/', el.length].join('')
				iterator++
				Api.socketRequest('taskcreate', JSON.stringify(toSend))
			})
		} else {
			Api.socketRequest('taskcreate', JSON.stringify(this.state))
		}

		browserHistory.push('/overview')
	}

	_removeAllTasks = () => {
		localStorage.removeItem(LOCAL_STORAGE_NAME)
		this.state = createDefaultStore()
		this.forceUpdate()
	}

	_print = (name, val, par) => {
		if (typeof par === 'string' || par instanceof String) {
			par = par.toLowerCase()
		}

		let tmp = this.state.taskdata
		let restartData = restarter(name, par)
		//req for restart data
		if (val && restartData) {
			tmp[par]['data'][name] = val
			Object.keys(restartData).map(e => tmp[par]['data'][e] = restartData[e])
		} else {
			tmp[par]['data'][name] = val
		}

		//do you need a crawler?
		let crawlEnab = (tmp.bruteforcetab.data.enable || tmp.xsstab.data.enable)

		this.setState({
			taskdata: tmp,
			crawlerisneed: crawlEnab,
		})
		localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify({
			taskname: this.state.taskname,
			serverHome: this.state.serverHome,
			crawlerdeep: this.state.crawlerdeep,
			crawlerisneed: crawlEnab,
			taskdata: tmp,
		}))
	}

	render = () => {

		const panes = [
			{
				menuItem: 'Brute force', render: () => <Tab.Pane>
					<Parent
						header='Brute force'
						storeFn={this._print}
						isEnable={this.state.taskdata.bruteforcetab.data.enable}
						name='BruteForceTab'
						child={
							<BruteForceTab
								storeFn={this._print}
								data={this.state.taskdata.bruteforcetab}
								name='BruteForceTab'
							/>
						}
					/>
				</Tab.Pane>,
			},
			{
				menuItem: 'XSS', render: () => <Tab.Pane>
					<Parent
						header='XSS'
						storeFn={this._print}
						isEnable={this.state.taskdata.xsstab.data.enable}
						name='XSSTab'
						child={
							<XSSTab
								storeFn={this._print}
								data={this.state.taskdata.xsstab}
								name='XSSTab'
							/>
						}
					/>
				</Tab.Pane>,
			},
			{
				menuItem: 'Other', render: () => <Tab.Pane>
					<Parent
						header='Other'
						storeFn={this._print}
						isEnable={this.state.taskdata.othertab.data.enable}
						name='OtherTab'
						child={
							<OtherTab
								storeFn={this._print}
								data={this.state.taskdata.othertab}
								name='OtherTab'
							/>
						}
					/>
				</Tab.Pane>,
			},
		]

		return (

			<div className="create-task-section" >
				<Tab panes={panes} />
				<Segment>
					<Header as="h3">Starter</Header>
					<Divider />
					<Header as="h5">URLs</Header>
					<Grid>
						<Grid.Row columns={1} textAlign="right">
							<Grid.Column>
								<Form>
									<TextArea
										id={'serverHome'}
										onChange={(d, e) => this._componentOnChangeText(d, e)}
										value={this.state.serverHome}
										placeholder="Server home"
									/>
								</Form>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row columns={1} textAlign="left">

							<Grid.Column>
								<Header as="h5">Crawler max deep	<Helper
									header='Crawler max deep'
									content='Specifies the maximum crawler depth. Use -1 for unlimited deep.'
								/>
								</Header>
								<Input
									id={'crawlerdeep'}
									onChange={(d, e) => this._componentOnChangeText(d, e)}
									value={this.state.crawlerdeep}
									placeholder="Max crawler deep"
									disabled={!this.state.crawlerisneed}
									fluid
								/>

							</Grid.Column>
						</Grid.Row>

						<Header as="h5">Task name</Header>
						<Grid.Row columns={2} textAlign="right">
							<Grid.Column>
								<Input
									id={'taskname'}
									onChange={(d, e) => this._componentOnChangeText(d, e)}
									value={this.state.taskname}
									placeholder="Task name"
									fluid
								/>
							</Grid.Column>
							<Grid.Column>
								<Button onClick={() => this._createTask()} color="green">Start task</Button>
							</Grid.Column>
						</Grid.Row>
					</Grid>
					<Divider inverted />
					<Button onClick={() => this._removeAllTasks()} inverted color="red" size="tiny">Remove last config</Button>
				</Segment>
			</div >
		)
	}
}