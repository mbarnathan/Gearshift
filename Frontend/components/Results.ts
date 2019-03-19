'use babel';

import {ResultGroup} from "./ResultGroup";
import {Result} from "./Result";

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

  render() {
    return html`
        <table id={this.props.id} className="results" cellSpacing="0" cellPadding="0">
    <thead>
        <tr>
            <th colSpan="2">Name</th>
        <th colSpan="2">Source</th>
        </tr>
        </thead>
    {this.props.children}
    </table>`;
  }

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
  }
}
