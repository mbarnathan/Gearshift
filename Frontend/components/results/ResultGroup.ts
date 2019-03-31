import {BaseResult} from "./BaseResult";

const LinkedMap = require("linked-map");

export class ResultGroup<Child extends BaseResult> extends BaseResult {
  protected children = new LinkedMap();
  protected focusedChild: Child | null = null;

  get defaultState() {
    let state = super.defaultState;
    state["children"] = this.children;
    return state;
  }

  public constructor(name: string) {
    super();
    this.name = name;
  }

  public matches(query: string): boolean {
    return true;  // Groups always match; empty groups are suppressed elsewhere.
  }

  public highlight(query: string): void {
    for (let child of this.children.values()) {
      child.highlight(query);
    }
  }

  public add(...children: Child[]) {
    for (let child of children) {
      this.children.push(child.id, child);
    }
    return this;
  }

  public replace(...new_items: Child[]) {
    this.children.clear();
    for (let new_item of new_items) {
      this.add(new_item);
    }
    this.focusedChild = null;  // TODO(mb): This is a hack.
    this.render();
    return this;
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

  // Nested ResultGroups don't wrap their focus,
  // so that behavior is omitted here and implemented in the top level ResultBox.

  public navigateUp(): boolean {
    return this.navigate(
        (children) => children.tailKey(),
        (children, id) => children.previousKey(id));
  }

  public navigateDown(): boolean {
    return this.navigate(
        (children) => children.headKey(),
        (children, id) => children.nextKey(id));
  }

  public navigate(wrap: Function, proceed: Function): boolean {
    if (this.children.size() == 0) {
      // It's empty, stop here.
      return true;
    }

    if (!this.focusedChild) {
      // Return the first (last on up) element of every subgroup.
      this.focusChildId(wrap(this.children));
      this.focusedChild!.navigate(wrap, proceed);
      return true;
    }

    // If there's still further to proceed in a sublevel, do that.
    if (this.focusedChild.navigate(wrap, proceed)) {
      return true;
    }

    // Otherwise, we're at the end of a sublist, and need to move once at this level.
    let nextKeyToFocus = proceed(this.children, this.focusedChild.id);
    this.focusChildId(nextKeyToFocus);

    // Return false if we've run off the list at this level, otherwise true.
    if (this.focusedChild) {
      this.focusedChild.navigate(wrap, proceed);
      return true;
    }
    return false;
  }

  public render() {
    return this.html`
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
