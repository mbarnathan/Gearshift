const React = require("react");

class ResultGroup extends React.Component {
  render() {
    return (
        <tbody id={this.props.id}>
        <tr>
          <th colspan="1000">
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
