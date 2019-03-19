'use babel';

export class Results extends ResultGroup<ResultGroup> {
  id: string;
  resultGroups: ResultGroup[];
  activeRow: Result;

  render() {
    return (
        <table id={this.props.id} className="results" cellSpacing="0" cellPadding="0">
          <thead>
          <tr>
            <th colSpan="2">Name</th>
            <th colSpan="2">Source</th>
          </tr>
          </thead>
          {this.props.children}
        </table>
    );
  }

  navigateDown() {
    const children = React.Children.toArray(this.props.children);
    if (children.length === 0) {
      return -1;
    }

    let active = this.activeRow();
    if (active >= 0 && active < children.length) {
      if (children[active].navigateDown() >= 0) {
        return active;
      }
    }
    this.activeRowIdx = active + 1;
    return this.navigateDown();
  }

  navigateUp() {
    const children = React.Children.toArray(this.props.children);
    if (children.length === 0) {
      return -1;
    }

    let active = this.activeRow();
    if (active >= 0 && active < children.length) {
      if (children[active].navigateUp() >= 0) {
        return active;
      }
    }
    this.activeRowIdx = active - 1;
    return this.navigateUp();
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
