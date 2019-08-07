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
      redirect: false,
      err: ""
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

  renderErr = errMsg => {
    return (
      <div className="auth-content-wrap auth-err-wrap">
        <svg
          style={{ marginLeft: "5px" }}
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          fill="#d93025"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
        <div className="auth-err-msg">{errMsg}</div>
      </div>
    );
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
        if (responseJson.success) {
          this.setState({
            documents: this.state.documents.concat({
              title: responseJson.title,
              id: responseJson.id
            }),
            newDocumentTitle: "",
            newDocumentPassword: ""
          });
        }
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
        console.log(responseJson);
        if (responseJson.error) {
          this.setState({ err: responseJson.message });
        } else if (responseJson.success) {
          this.setState({
            documents: this.state.documents.concat({
              title: responseJson.title,
              id: responseJson.id
            }),
            sharedDocumentID: "",
            sharedDocumentPassword: ""
          });
        } else {
          this.setState({ err: responseJson.message });
        }
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
                    {this.state.redirect && <Redirect to={"/docs/" + document.id} />}
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
          {this.state.err && this.renderErr(this.state.err)}
        </div>
      </div>
    );
  }
}

export default DocumentPortal;
