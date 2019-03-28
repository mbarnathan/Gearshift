import {BaseResult} from "./BaseResult";
import * as _ from "lodash";
import * as $ from "jquery";
import hyper from "hyperhtml";

export class Result extends BaseResult {
  public _service?: string;

  constructor(name: string, readonly path:string, readonly modified: Date,
              readonly mimetype: string,
              readonly size: number, _service?: string) {
    super();
    this.name = name;
    this._service = _service;
  }

  public get service(): string {
    return this._service || _.startCase(this.constructor.name.replace(/Result$/, ""));
  }

  public set service(_service: string) {
    this._service = _service;
  }

  public get id():string {
    let base_id = this.path + "_" + this.service;
    return _.snakeCase(_.deburr(base_id).replace(/[\W]/g, ""));
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
    let query = $("#search").val();
    let name = [this.name];
    if (query) {
      // TODO(mb): Don't want to recreate this regex over and over.
      let regex = new RegExp(`(${query})`, "igu");
      let groups = this.name.split(regex);
      for (let group_idx in groups) {
        if (groups[group_idx].toLocaleLowerCase() == query.toString().toLocaleLowerCase()) {
          groups[group_idx] = hyper`<span class="match">${groups[group_idx]}</span>`;
        } else {
          groups[group_idx] = hyper`${groups[group_idx]}`;
        }
      }
      name = groups;
    }
    return this.html`
        <tr class="${this.focused() ? "focused" : "unfocused"}">
          <td class="thumbnail"><img src="${this.icon()}" alt="" /></td>
          <td class="filename"><span class="name">${name}</span> <span class="path">(${this.path})</span></td>
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
