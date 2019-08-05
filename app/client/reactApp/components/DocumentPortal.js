import React, { Component } from "react";
import "../css/documentPortal.css";

class DocumentPortal extends Component {
  constructor() {
    super();
    this.state = {
      newDocumentTitle: "",
      sharedDocID: "",
      documents: [
        { title: "Test", id: "test" },
        { title: "My Document 2", id: "test" },
        { title: "Todo List", id: "test" }
      ]
    };

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
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
  }

  addSharedDocument(event) {
    event.preventDefault();
    console.log("Add shared document.");
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
                  <li>
                    <i className="icon fas fa-file-alt" />
                    {document.title}
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
