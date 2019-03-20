import * as _ from "lodash";
import {Result} from "./Result";
import {hyper} from "hyperhtml";
const LinkedMap = require("linked-map");

export class ResultGroup<Child extends Result> extends Result {
  public name: string;
  protected children = new LinkedMap();
  protected focusedChild: Child | null = null;

  public get id():string {
    return "results_" + _.snakeCase(this.name);
  }

  public add(...children: Child[]) {
    for (let child of children) {
      this.children.push(child.id, child);
    }
  }

  public focusChild(child: Child|null):void {
    this.focusChildId((child) ? child.id : null);
  }

  public focusChildId(child_id: string|null):void {
    if (this.focusedChild) {
      this.focusedChild.blur();
      this.focusedChild = null;
    }

    if (child_id == null) {
      return;
    }

    this.focusedChild = this.children.get(child_id);
    if (!this.focusedChild) {
      return;
    }
    this.focusedChild.focus();
  }

  navigateUp(): boolean {
    if (this.focusedChild) {
      // Navigate up at the deepest level of nesting.
      if (this.focusedChild.navigateUp && this.focusedChild.navigateUp()) {
        return true;
      }

      // Child is not navigable / at top. Move to the previous group and repeat.
      this.focusChildId(this.children.previousKey(this.focusedChild.id));
      return this.navigateUp();
    }

    // We ran off the sublist. Allow the parent to take over.
    return false;
  }

  navigateDown(): boolean {
    if (this.focusedChild) {
      // Navigate down at the deepest level of nesting.
      if (this.focusedChild.navigateDown && this.focusedChild.navigateDown()) {
        return true;
      }

      // Child is not navigable / at bottom. Move to the next group and repeat.
      this.focusChildId(this.children.nextKey(this.focusedChild.id));
      return this.navigateDown();
    }

    // We ran off the sublist. Allow the parent to take over.
    return false;
  }

  // TODO(mb): Actions can go here too.

  public template(): HTMLElement {
    return hyper`
        <tbody id="${this.id}">
          <tr>
            <th colspan="1000">
              <header><h2>${this.name}</h2>
                <hr />
              </header>
            </th>
          </tr>
          ${this.children.values()}
        </tbody>`;
  }
}
