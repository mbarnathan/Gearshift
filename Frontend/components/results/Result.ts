import {BaseResult} from "./BaseResult";
import * as _ from "lodash";

export class Result extends BaseResult {
  public _service?: string;

  constructor(readonly filename: string, readonly path:string, readonly modified: Date,
              readonly size: number, _service?: string) {
    super();
    this._service = _service;
  }

  public get service(): string {
    return this._service || _.startCase(this.constructor.name.replace(/Result$/, ""));
  }

  public set service(_service: string) {
    this._service = _service;
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

  public render() {
    return this.html`
        <tr class="${this.focused() ? "focused" : "unfocused"}">
          <td class="thumbnail"><img src="${this.icon()}" alt="" /></td>
          <td><span class="filename">${this.filename}</span> <span class="path">(${this.path})</span></td>
          <td><time>${this.modified.toLocaleString()}</time></td>
          <td>${this.size}</td>
          <td class="rightcol">
            <ul class="actions">
              ${this.actions}
            </ul>
            ${this.service}
          </td>
          <td class="thumbnail"><img src="${this.icon()}" alt="${this.service}" /></td>
        </tr>`;
  }
}
