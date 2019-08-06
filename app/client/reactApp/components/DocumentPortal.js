import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../css/documentPortal.css";

const BACKEND = "https://613cbc44.ngrok.io";

class DocumentPortal extends Component {
  constructor() {
    super();
    this.state = {
      newDocumentTitle: "",
      newDocumentPassword: "",
      sharedDocumentID: "",
      sharedDocumentPassword: "",
      documents: [],
      redirect: false
    };
  }

  componentDidMount() {
    fetch(BACKEND + "/docs", {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ documents: responseJson.docs });
      });
  }

  handleTitleChange = event => {
    this.setState({ newDocumentTitle: event.target.value });
  };

  handleNewDocumentPasswordChange = event => {
    this.setState({ newDocumentPassword: event.target.value });
  };

  handleSharedDocumentPasswordChange = event => {
    this.setState({ sharedDocumentPassword: event.target.value });
  };

  handleIDChange = event => {
    this.setState({ sharedDocumentID: event.target.value });
  };

  createNewDocument = event => {
    event.preventDefault();
    console.log(this.state.newDocumentTitle, this.state.newDocumentPassword);
    fetch(BACKEND + "/docs/new", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: this.state.newDocumentTitle,
        password: this.state.newDocumentPassword
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          documents: this.state.documents.concat({
            title: responseJson.title,
            id: responseJson.id
          })
        });
      });
  };

  addSharedDocument = event => {
    event.preventDefault();
    fetch(BACKEND + "/docs/shared", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: this.state.sharedDocumentID,
        password: this.state.sharedDocumentPassword
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          documents: this.state.documents.concat({
            title: responseJson.title,
            id: responseJson.id
          })
        });
      });
  };

  gotoDocument = () => {
    this.setState({ redirect: true });
  };

  render() {
    return (
      <div className="wrapper">
        <div className="portal">
          <h1>Document Portal</h1>
          <div className="content-wrap">
            <input
              className="input"
              type="text"
              value={this.state.newDocumentTitle}
              onChange={this.handleTitleChange}
              placeholder="New Document Title"
            />
            <input
              className="input"
              type="password"
              value={this.state.newDocumentPassword}
              onChange={this.handleNewDocumentPasswordChange}
              placeholder="Password"
            />
            <button className="button" onClick={this.createNewDocument}>
              +
            </button>
          </div>

          <div className="documents">
            <div className="title">My Documents</div>
            <ul>
              {this.state.documents.map(document => {
                return (
                  <li key={document.id} onClick={this.gotoDocument}>
                    <i className="icon fas fa-file-alt" />
                    {document.title}
                    {this.state.redirect && (
                      <Redirect to={"/docs/" + document.id} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="content-wrap">
            <input
              className="input"
              type="text"
              value={this.state.sharedDocumentID}
              onChange={this.handleIDChange}
              placeholder="Shared Document ID"
            />
            <input
              className="input"
              type="password"
              value={this.state.sharedDocumentPassword}
              onChange={this.handleSharedDocumentPasswordChange}
              placeholder="Password"
            />
            <button className="button" onClick={this.addSharedDocument}>
              +
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DocumentPortal;
