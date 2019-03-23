import {ResultGroup} from "./ResultGroup";
import {BaseResult} from "./BaseResult";
import {hyper} from "hyperhtml";

export class ResultBox extends ResultGroup<BaseResult> {
  private _id?:string;

  public get id():string {
    return this._id || "results";
  }

  public set id(new_id:string) {
    this._id = new_id;
  }

  public navigate(wrap: Function, proceed: Function): boolean {
    if (!super.navigate(wrap, proceed)) {
      // Hit bottom or empty selection and focus is now cleared; nav again to wrap to top.
      return this.navigate(wrap, proceed);
    }
    return true;
  }

  render() {
    return hyper`
<table id="${this.id}" class="results" cellspacing="0" cellpadding="0">
  <thead>
    <tr>
      <th colspan="2">Name</th>
      <th colspan="2">Source</th>
    </tr>
  </thead>
  ${this.children.values()}
</table>`;
  }

  bindArrowKeys() {
    Mousetrap.bind("up", () => this.navigateUp());
    Mousetrap.bind("down", () => this.navigateDown());
  }
}
