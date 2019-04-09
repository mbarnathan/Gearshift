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

  public score(query: string): number {
    return this.children.size();
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
    let oldFocus: string|null = this.focusedChild ? this.focusedChild.id : null;
    this.children.clear();
    let newFocus: string|null = null;
    for (let new_item of new_items) {
      if (new_item.id == oldFocus) {
        newFocus = new_item.id;
      }
      this.add(new_item);
    }
    newFocus = newFocus || this.children.headKey();
    if (newFocus && this.focused()) {
      this.focusChildId(newFocus);
    }
    this.render();
    return this;
  }

  public getChildren() {
    return this.children.immutableView();
  }

  /** Take the default (first) action on this element. */
  public activate(): void {
    if (this.focusedChild) {
      this.focusedChild.activate();
    } else {
      // In case the group has actions defined (this is not common, but possible).
      super.activate();
    }
  }

  public blur(): void {
    super.blur();
    this.focusChildId(null);
  }

  public focusChild(child: Child|null):void {
    this.focusChildId((child) ? child.id : null);
  }

  public focusChildId(child_id: string|null):void {
    if (this.focusedChild) {
      if (this.focusedChild.id == child_id) {
        return;  // Already focused.
      }

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

  private static nextToFocus(children, id: string): string {
    return children.nextKey(id);
  }

  public navigateUp(): boolean {
    return this.navigate(
        (children) => children.tailKey(),
        (children, id) => children.previousKey(id));
  }

  public navigateDown(): boolean {
    return this.navigate((children) => children.headKey(), ResultGroup.nextToFocus);
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

  protected childFromMouseEvent(evt: MouseEvent): Child|null {
    for (let target of evt.composedPath()) {
      let element = target as Element;
      let child = this.children.get(element.id);
      if (child) {
        return child;
      }
    }
    return null;
  }

  public onclick(evt: MouseEvent) {
    let clicked = this.childFromMouseEvent(evt);
    if (clicked) {
      this.focusChild(clicked);
    }
  }

  public ondblclick(evt: MouseEvent) {
    evt.preventDefault();
    let clicked = this.childFromMouseEvent(evt);
    if (clicked) {
      clicked.activate();
    }
  }

  public renderIfVisible() {
    return this.html`
        <tbody id="${this.id}" onclick="${this}" ondblclick="${this}">
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
