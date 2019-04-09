import {BaseResult} from "./BaseResult";
import * as _ from "lodash";

// TODO(mb): This holds too much information. It should be called Document and BaseResult should be more complete.
export class Result extends BaseResult {
  public _service?: string;
  private _highlit_name?: string[];

  constructor(name: string, readonly path:string, readonly modified: Date,
              readonly accessed: Date|null = null,
              readonly mimetype: string,
              readonly size: number, readonly properties: Object = {}, _service?: string) {
    super();
    this.name = name;
    this._service = _service;
  }

  private get highlit_name(): string[] {
    return this._highlit_name || [this.name];
  }

  private set highlit_name(value: string[]) {
    this._highlit_name = value;
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

  private highlight_groups(text: string, query: string): string[] {
    if (!text || !query) {
      return [text];
    }
    let regex = new RegExp(`(${query})`, "igu");
    let groups = text.split(regex);
    for (let group_idx in groups) {
      if (regex.test(groups[group_idx])) {
        groups[group_idx] = `<span class="match">${groups[group_idx]}</span>`;
      } else {
        groups[group_idx] = `${groups[group_idx]}`;
      }
    }
    return groups;
  }

  public highlight(query: string): void {
    let old_highlit = this.highlit_name;
    this.highlit_name = this.highlight_groups(this.name, query);
    if (this.highlit_name != old_highlit) {
      this.render();
    }
  }

  public format_size(size_in_bytes: number): string {
    if (isNaN(size_in_bytes)) {
      return "";
    }

    if (size_in_bytes < 1000) {
      return `${size_in_bytes} bytes`;
    }

    if (size_in_bytes < 10 ** 6) {
      return `${(size_in_bytes / 2 ** 10).toFixed(1)} KB`;
    }

    if (size_in_bytes < 10 ** 9) {
      return `${(size_in_bytes / 2 ** 20).toFixed(1)} MB`;
    }

    if (size_in_bytes < 10 ** 12) {
      return `${(size_in_bytes / 2 ** 30).toFixed(1)} GB`;
    }

    return `${(size_in_bytes / 2 ** 40).toFixed(1)} TB`;
  }

  public render() {
    return this.html`
        <tr class="${this.focused() ? "focused" : "unfocused"}" id="${this.id}">
          <td class="thumbnail"><img src="${this.icon()}" alt="" /></td>
          <td class="filename"><span class="name" title="${this.name}">${this.highlit_name}</span> <span class="path" title="${this.path}">(${this.path})</span></td>
          <td class="modified"><time>${this.modified.toLocaleString()}</time></td>
          <td class="accessed"><time>${(this.accessed || "Never").toLocaleString()}</time></td>
          <td class="size">${this.format_size(this.size)}</td>
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
