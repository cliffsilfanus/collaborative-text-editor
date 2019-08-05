import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../css/documentPortal.css";

const BACKEND = "";

class DocumentPortal extends Component {
  constructor() {
    super();
    this.state = {
      newDocumentTitle: "",
      sharedDocID: "",
      documents: [
        { title: "Test", id: "test" },
        { title: "My Document 2", id: "test1" },
        { title: "Todo List", id: "test2" }
      ],
      redirect: false
    };

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.gotoDocument = this.gotoDocument.bind(this);
  }

  componentDidMount() {
    fetch(BACKEND + "/docs")
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ documents: responseJson });
      });
  }

  handleTitleChange(event) {
    this.setState({ newDocumentTitle: event.target.value });
  }

  handleIDChange(event) {
    this.setState({ sharedDocID: event.target.value });
  }

  createNewDocument(event) {
    event.preventDefault();
    console.log("Create new document.");
    fetch(BACKEND + "/docs/new", {
      method: "POST",
      headers: {
        "Content-Type": "applicaiotn/json"
      },
      body: JSON.stringify({
        title: this.state.newDocumentTitle
      })
    })
      .then(response => response.json())
      .then(responseJson => console.log(responseJson));
  }

  addSharedDocument(event) {
    event.preventDefault();
    console.log("Add shared document.");
    // post do /docs/shared
  }

  gotoDocument() {
    this.setState({ redirect: true });
  }

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
              value={this.state.sharedDocID}
              onChange={this.handleIDChange}
              placeholder="Shared Document ID"
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
