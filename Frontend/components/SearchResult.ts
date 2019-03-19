'use babel';
import {Result} from "./Result";

export class SearchResult extends Result {
  service: string;

  protected icon() {
    return "themes/default/icons/services/" + this.service.toLowerCase() + ".svg";
  }

  // These are single results and don't contain children to navigate over.
  navigateDown():boolean {
    return true;
  }

  navigateUp():boolean {
    return true;
  }

    render():string {
      return html`
          <tr className={this.state.active ? "active" : "inactive"}>
            <td className="thumbnail"><img src={this.icon()} /></td>
            <td><span className="filename">{this.filename}</span> <span className="path">({this.path})</span></td>
            <td><time>{this.modified}</time></td>
            <td>{this.size}</td>
            <td className="rightcol">{this.service}</td>
            <td className="thumbnail"><img src={this.icon()} /></td>
          </tr>`;
    }
}
