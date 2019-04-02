import {ResultGroup} from "./ResultGroup";
import {BaseResult} from "./BaseResult";
import {hyper} from "hyperhtml";
import * as _ from "lodash";
import * as $ from "jquery";
import "jquery.scrollto";

export class ResultBox extends ResultGroup<BaseResult> {
  public get id():string {
    return _.snakeCase(this.name);
  }

  public navigate(wrap: Function, proceed: Function): boolean {
    let nestedResult = true;
    if (!super.navigate(wrap, proceed)) {
      // Hit bottom or empty selection and focus is now cleared; nav again to wrap to top.
      nestedResult = this.navigate(wrap, proceed);
    }
    if (this.element) {
      let focused = $(this.element).find(".focused").first();
      $(this.element).find(".results").scrollTo(focused);
    }
    return nestedResult;
  }

  public ondblclick(evt: MouseEvent) {
    evt.preventDefault();
  }

  render() {
    return hyper`
<table id="${this.id}" onclick="${this}" ondblclick="${this}" class="results" cellspacing="0" cellpadding="0">
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
    Mousetrap.bind("up", () => {this.navigateUp(); return false});
    Mousetrap.bind("down", () => {this.navigateDown(); return false});

    // TODO(mb): Better paging.
    Mousetrap.bind("pageup", () => {for (let i = 0; i < 10; i++) { this.navigateUp(); }; return false});
    Mousetrap.bind("pagedown", () => {for (let i = 0; i < 10; i++) { this.navigateDown(); }; return false});

    Mousetrap.bind("enter", () => {this.activate(); return false});
  }
}
