'use babel';
import React from 'react';
const Mousetrap = require("mousetrap");

export class Results extends React.Component {
  constructor(props) {
    super(props);
    this.activeRowIdx = -1;

    this.activeRow = this.activeRow.bind(this);
    this.navigateDown = this.navigateDown.bind(this);
    this.navigateUp = this.navigateUp.bind(this);
  }

  render() {
    return (
        <table id={this.props.id} className="results" cellSpacing="0" cellPadding="0">
          <thead>
          <tr>
            <th colSpan="2">Name</th>
            <th colSpan="2">Source</th>
          </tr>
          </thead>
          {this.props.children}
        </table>
    );
  }

  activeRow() {
    return this.activeRowIdx;
  }

  navigateDown() {
    const children = React.Children.toArray(this.props.children);
    if (children.length === 0) {
      return -1;
    }

    let active = this.activeRow();
    if (active >= 0 && active < children.length) {
      if (children[active].navigateDown() >= 0) {
        return active;
      }
    }
    this.activeRowIdx = active + 1;
    return this.navigateDown();
  }

  navigateUp() {
    const children = React.Children.toArray(this.props.children);
    if (children.length === 0) {
      return -1;
    }

    let active = this.activeRow();
    if (active >= 0 && active < children.length) {
      if (children[active].navigateUp() >= 0) {
        return active;
      }
    }
    this.activeRowIdx = active - 1;
    return this.navigateUp();
  }

  bindArrowKeys() {
    Mousetrap.bind("up", this.navigateUp);
    Mousetrap.bind("down", this.navigateDown);
    this.bound = true;
  }

  componentWillUnmount() {
    if (this.bound) {
      Mousetrap.unbind("up");
      Mousetrap.unbind("down");
      this.bound = false;
    }
  }
}
