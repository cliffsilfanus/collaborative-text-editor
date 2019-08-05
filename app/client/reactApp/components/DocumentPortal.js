import React, { Component } from "react";
import "../css/documentPortal.css";

class DocumentPortal extends Component {
  constructor() {
    super();
    this.state = {
      newDocumentTitle: "",
      sharedDocID: "",
      documents: [{ title: "Test", id: "test" }]
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
      <>
        <h1>Document Portal</h1>
        <input
          type="text"
          value={this.state.newDocumentTitle}
          onChange={this.handleTitleChange}
        />
        <button onClick={this.createNewDocument}>Create New Document</button>
        <div>
          My Documents
          {this.state.documents.map(document => {
            return <li>{document.title}</li>;
          })}
        </div>
        <input
          type="text"
          value={this.state.sharedDocID}
          onChange={this.handleIDChange}
        />
        <button onClick={this.addSharedDocument}>Add Shared Document</button>
      </>
    );
  }
}

export default DocumentPortal;
