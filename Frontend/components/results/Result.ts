import {Action} from "../Actions/Action";
import {BaseResult} from "./BaseResult";

export class Result extends BaseResult {
  constructor(readonly filename: string, readonly service: string,
              readonly path:string, readonly modified: Date, readonly size: number) {
    super();
  }

  public get id():string {
    return this.path + "_" + this.service;
  }

  public icon(): string {
    return "themes/default/icons/services/" + this.service.toLowerCase() + ".svg";
  }

  // These are single results and don't contain children to navigate over.
  public navigate(wrap: Function, proceed: Function): boolean {
    return false;
  }

  public navigateDown():boolean { return this.navigate(() => null, () => null); }
  public navigateUp():boolean { return this.navigate(() => null, () => null); }

  public actions(context?: Context): Action[] {
    return [];
  }

  public render() {
    return this.html`
        <tr class="${this.focused() ? "focused" : "unfocused"}">
          <td class="thumbnail"><img src="${this.icon()}" /></td>
          <td><span class="filename">${this.filename}</span> <span class="path">(${this.path})</span></td>
          <td><time>${this.modified.toLocaleString()}</time></td>
          <td>${this.size}</td>
          <td class="rightcol">${this.service}</td>
          <td class="thumbnail"><img src="${this.icon()}" /></td>
        </tr>`;
  }
}
