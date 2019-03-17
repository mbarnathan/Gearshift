'use babel';
import React from 'react';

export class ResultGroup extends React.Component {
  render() {
    return (
        <tbody id={this.props.id}>
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
}
