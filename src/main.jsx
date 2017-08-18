const React = require('react');
const ReactDOM = require('react-dom');
const PageRouter = require('./components/pages/Router')

require('semantic-ui-css/semantic.css')

ReactDOM.render(
  <PageRouter />,
  document.getElementById('main')
)
