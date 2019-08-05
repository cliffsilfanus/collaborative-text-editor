import React, { Component } from 'react';
import Login from './Login';
import Register from './Register';
import DocumentPortal from './DocumentPortal';
import { BrowserRouter, Route } from 'react-router-dom';

class TextApp extends Component {
	render() {
		return (
			<BrowserRouter>
				<Route path="/" exact component={Login} />
				<Route path="/register" component={Register} />
				<Route path="/docs" component={DocumentPortal} />
			</BrowserRouter>
		);
	}
}

export default TextApp;
