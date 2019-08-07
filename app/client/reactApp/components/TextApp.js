import React, { Component } from 'react';
import Login from './Login';
import Register from './Register';
import DocumentPortal from './DocumentPortal';
import TextEditor from './TextEditor';
import { BrowserRouter, Route } from 'react-router-dom';
import BACKEND from './Backend';
import io from 'socket.io-client';

class TextApp extends Component {
	constructor(props) {
		super(props);
		this.socket = null;
	}

	componentDidMount = () => {
		this.socket = io(BACKEND, { forceNew: true });
		this.socket.on('disconnect', reason => {
			if (reason === 'io server disconnect') {
				this.socket.close();
				this.socket.connect();
			}
		});
	};

	componentWillUnmount = () => {
		this.socket.close();
	};

	render() {
		return (
			<BrowserRouter>
				<Route path="/" exact component={Login} />
				<Route path="/register" component={Register} />
				<Route
					path="/docs"
					exact
					render={() => <DocumentPortal socket={this.socket} />}
				/>
				<Route
					path="/docs/:docId"
					render={props => (
						<TextEditor
							docId={props.match.params.docId}
							socket={this.socket}
						/>
					)}
				/>
			</BrowserRouter>
		);
		// return <TextEditor />;
	}
}

export default TextApp;
