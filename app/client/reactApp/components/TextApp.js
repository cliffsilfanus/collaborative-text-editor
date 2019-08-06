import React, { Component } from "react";
<<<<<<< HEAD
import TextEditor from "./TextEditor";

export default class TextApp extends Component {
  render() {
    return <TextEditor />;
  }
}
=======
import Login from "./Login";
import Register from "./Register";
import DocumentPortal from "./DocumentPortal";
import { BrowserRouter, Route } from "react-router-dom";

class TextApp extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route path="/" exact component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/docs" exact component={DocumentPortal} />
      </BrowserRouter>
    );
  }
}

export default TextApp;
>>>>>>> 833bf664ab72804c21699a133c85c6afbe3daae9
