import {ResultGroup} from "./ResultGroup";
import {BaseResult} from "./BaseResult";
import {hyper} from "hyperhtml";
import * as _ from "lodash";

export class ResultBox extends ResultGroup<BaseResult> {
  public get id():string {
    return _.snakeCase(this.name);
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
