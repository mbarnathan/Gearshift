'use babel';
import _ = require('lodash');
import LinkedMap = require('linked-map');

export class ResultGroup<Child extends Resultable> implements Resultable {
  name: string;
  children: LinkedMap<string, Child>;
  focusedChild?: Child = null;
  focused: boolean;

  id():string {
    return "results_" + _.snakeCase(this.name);
  }

  focus():void {
    this.focused = true;
  }

  blur(): void {
    this.focused = false;
  }

  focusChild(child?: Child):void {
    this.focusChild((child) ? child.id : null);
  }

  focusChild(child_id?: string):void {
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

  focusWraps() {
    return true;
  }

  navigateUp() {
    let nextToFocus:string = (this.focusedChild)
        ? this.children.previousKey(this.focusedChild.id, this.focusWraps())
        : this.children.tailKey();
    this.focusChild(nextToFocus);
  }

  navigateDown() {
    let nextToFocus:string = (this.focusedChild)
        ? this.children.nextKey(this.focusedChild.id, this.focusWraps())
        : this.children.headKey();
    this.focusChild(nextToFocus);
  }

  render() {
    return (
        <tbody id={this.props.id} key={this.props.id}>
          <tr>
            <th colSpan="1000">
              <header><h2>{this.props.name}</h2>
                <hr />
              </header>
            </th>
          </tr>
          {this.props.children}
        </tbody>
    );
  }
}
