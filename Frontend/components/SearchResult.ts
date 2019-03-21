import {Result} from "./Result";

export class SearchResult extends Result {
  filename: string;
  path: string;
  modified: Date;
  size: number;
  service: string;

  protected icon(): string {
    return "themes/default/icons/services/" + this.service.toLowerCase() + ".svg";
  }

  // These are single results and don't contain children to navigate over.
  navigateDown():boolean {
    return true;
  }

  navigateUp():boolean {
    return true;
  }

  render() {
    return this.html`
        <tr class="${this.focused() ? "active" : "inactive"}">
          <td class="thumbnail"><img src="${this.icon()}" /></td>
          <td><span class="filename">${this.filename}</span> <span class="path">(${this.path})</span></td>
          <td><time>${this.modified.toLocaleString()}</time></td>
          <td>${this.size}</td>
          <td class="rightcol">${this.service}</td>
          <td class="thumbnail"><img src="${this.icon()}" /></td>
        </tr>`;
  }
}
