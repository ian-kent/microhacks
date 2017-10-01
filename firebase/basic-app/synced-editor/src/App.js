import React, { Component } from 'react';

const style = {
  width: "100%",
  height: "100%",
  padding: "0",
  border: "0",
  margin: "0",
  whiteSpace: "pre",
  fontFamily: "monospace",
  fontSize: "18px",
};

class App extends Component {
  constructor() {
    super();

    this.state = {
      uid: null,
      content: "Loading...",
      selection: null,
      name: null,
    };

    this.updateDoc = this.updateDoc.bind(this);
    this.selectionChange = this.selectionChange.bind(this);

    this.restoreSelection = this.restoreSelection.bind(this);
  }

  restoreSelection()
  {
      if (this.state.selection != null) {
          if (window.getSelection)//non IE and there is already a selection
          {
              var s = window.getSelection();
              if (s.rangeCount > 0) 
                  s.removeAllRanges();
              s.addRange(this.state.selection);
          }
          else if (document.createRange)//non IE and no selection
          {
              window.getSelection().addRange(this.state.selection);
          }
          else if (document.selection)//IE
          {
              this.state.selection.select();
          }
      }
  }

  componentWillMount() {
    const search = window.location.search.substr(1);
    const parts = search.split(":");
    const uid = parts[0];
    const username = parts[1];
    const name = decodeURIComponent(parts[2]);

    this.setState({uid:uid, username: username, name:name});
    const email = uid + "@synced-editor.ian-kent.github.io";

    window.firebase.auth().signOut();
    window.firebase.auth().signInWithEmailAndPassword(email, uid).then((userData) => {
        console.log(userData);

        const doc = window.firebase.database().ref('/documents/' + uid + '/content');
        doc.on('value', (doc) => {
            console.log('Got document', doc);
            console.log("doc", doc.val().length);
            console.log("state", this.state.content.length);
            if(doc.val() !== this.state.content) {
              console.log("updating state");
                this.setState({content:doc.val()});
            }
        });
        const selection = window.firebase.database().ref('/documents/' + uid + '/selection');
        selection.on('value', (selection) => {
            console.log('Got selection', selection);
        });
    }, (error) => {
        console.log('User login failed: ', error);
    })
  }

  updateDoc(event) {
    console.log("updating", event.target.innerText);
    this.setState({content: event.target.innerText});
    window.firebase.database().ref('/documents/' + this.state.uid + "/content").set(event.target.innerText, error => {
      if(error !== null) {
        console.log(error);
        return;
      }
    });
  }

  selectionChange(event) {
    let selection = {};

    if(window.getSelection().rangeCount > 0) {
      const sel = window.getSelection().getRangeAt(0);
      selection.start = sel.startOffset;
      selection.end = sel.endOffset;
      selection.name = this.state.name;
    }
    
    window.firebase.database().ref('/documents/' + this.state.uid + "/selection/" + this.state.username).set(selection, error => {
      if(error !== null) {
        console.log(error);
        return;
      }
    });
  }

  render() {
    return (
      <div contentEditable={true} onSelect={this.selectionChange} onInput={this.updateDoc} style={style}>{ this.state.content }</div>
    );
  }
}

export default App;
