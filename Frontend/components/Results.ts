'use babel';

import {ResultGroup} from "./ResultGroup";
import {Result} from "./Result";
import {html, TemplateResult} from "lit-html";

export class Results extends ResultGroup<Result> {
  private _id?:string;

  public get id():string {
    return this._id;
  }

  public set id(new_id:string) {
    this._id = new_id;
  }

  navigateUp(): boolean {
    if (!super.navigateUp()) {
      // Hit top or empty selection; wrap to bottom.
      this.focusChildId(this.children.tailKey());
    }
    return true;
  }

  navigateDown(): boolean {
    if (!super.navigateDown()) {
      // Hit bottom or empty selection; wrap to top.
      this.focusChildId(this.children.headKey());
    }
    return true;
  }

  template(): TemplateResult {
    return html`
<table id=${this.id} class="results" cellspacing="0" cellpadding="0">
  <thead>
    <tr>
      <th colspan="2">Name</th>
      <th colspan="2">Source</th>
    </tr>
  </thead>
  ${this.children.values()}
</table>`;
  }
/*
  bindArrowKeys() {
    Mousetrap.bind("up", this.navigateUp);
    Mousetrap.bind("down", this.navigateDown);
    this.bound = true;
  }

  componentWillUnmount() {
    if (this.bound) {
      Mousetrap.unbind("up");
      Mousetrap.unbind("down");
      this.bound = false;
    }
  }*/
}