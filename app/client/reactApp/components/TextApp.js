import React, { Component } from 'react';
import Login from './Login';
import Register from './Register';
import DocumentPortal from './DocumentPortal';
import TextEditor from './TextEditor';
import { BrowserRouter, Route } from 'react-router-dom';
import BACKEND from './Backend';
import io from 'socket.io-client';

const socket = io(BACKEND, { forceNew: true });

class TextApp extends Component {
	render() {
		return (
			<BrowserRouter>
				<Route path="/" exact component={Login} />
				<Route path="/register" component={Register} />
				<Route path="/docs" exact component={DocumentPortal} />
				<Route
					path="/docs/:id"
					render={props => (
						<TextEditor
							id={props.match.params.id}
							socket={socket}
						/>
					)}
				/>
			</BrowserRouter>
		);
		// return <TextEditor />;
	}
}

export default TextApp;
