'use babel';
import React from 'react';

export class ResultGroup extends React.Component {
  constructor(props) {
    super(props);
    this.activeRowIdx = -1;

    this.activate = this.activate.bind(this);
    this.activeRow = this.activeRow.bind(this);
    this.navigateDown = this.navigateDown.bind(this);
    this.navigateUp = this.navigateUp.bind(this);
  }

  render() {
    return (
        <tbody id={this.props.id} key={this.props.id}>
          <tr>
            <th colSpan="1000">
              <header><h2>{this.props.name}</h2>
                <hr />
              </header>
            </th>
          </tr>
          {this.props.children}
        </tbody>
    );
  }

  activate(rowIndex) {
    const children = React.Children.toArray(this.props.children);
    children.forEach(child => console.log(child));
    if (rowIndex < 0 || rowIndex >= children.length) {
      rowIndex = -1;
    }
    if (rowIndex >= 0) {
      children[rowIndex].activate();
    }
    this.activeRowIdx = rowIndex;
    return rowIndex;
  }

  activeRow() {
    return this.activeRowIdx;
  }

  navigateDown() {
    return this.activate(this.activeRow() + 1);
  }

  navigateUp() {
    return this.activate(this.activeRow() - 1);
  }
}
