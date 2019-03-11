const React = require("react");

class Result extends React.Component {
  icon() {
    return "themes/default/icons/services/" + this.props.service.toLowerCase() + ".svg";
  }

  render() {
    return (
        <tr>
          <td className="thumbnail"><img src={this.icon()} /></td>
          <td><span className="filename">{this.props.filename}</span> <span className="path">({this.props.path})</span></td>
          <td><time>{this.props.modified}</time></td>
          <td>{this.props.size}</td>
          <td className="rightcol">{this.props.service}</td>
          <td className="thumbnail"><img src={this.icon()} /></td>
        </tr>
    );
  }
}
