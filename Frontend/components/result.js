'use babel';
import React from 'react';

export class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {active: false};

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.icon = this.icon.bind(this);
  }

  icon() {
    return "themes/default/icons/services/" + this.props.service.toLowerCase() + ".svg";
  }

  render() {
    return (
        <tr className={this.state.active ? "active" : "inactive"}>
          <td className="thumbnail"><img src={this.icon()} /></td>
          <td><span className="filename">{this.props.filename}</span> <span className="path">({this.props.path})</span></td>
          <td><time>{this.props.modified}</time></td>
          <td>{this.props.size}</td>
          <td className="rightcol">{this.props.service}</td>
          <td className="thumbnail"><img src={this.icon()} /></td>
        </tr>
    );
  }

  activate() {
    return this.setState({active: true});
  }

  deactivate() {
    return this.setState({active: false});
  }
}
