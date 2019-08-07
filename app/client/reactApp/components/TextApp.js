import React, { Component } from "react";
import Login from "./Login";
import Register from "./Register";
import DocumentPortal from "./DocumentPortal";
import TextEditor from "./TextEditor";
import { BrowserRouter, Route } from "react-router-dom";
import BACKEND from "./Backend";
import io from "socket.io-client";

const socket = io(BACKEND, { forceNew: true });

class TextApp extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route path="/" exact component={Login} />
        <Route path="/register" component={Register} />
        <Route
          path="/docs"
          exact
          render={() => <DocumentPortal socket={socket} />}
        />
        <Route
          path="/docs/:docId"
          render={props => (
            <TextEditor docId={props.match.params.docId} socket={socket} />
          )}
        />
      </BrowserRouter>
    );
    // return <TextEditor />;
  }
}

export default TextApp;
