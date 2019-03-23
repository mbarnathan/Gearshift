import hyper from "hyperhtml";

export class Action extends hyper.Component {
  protected constructor(readonly name: string, readonly url: string, readonly action_icon: string) {
    super();
  }

  public icon(): string {
    return "themes/default/icons/actions/" + this.action_icon;
  }

  public launch(context?: Context): void {
    require("shell").openExternal(this.url);
  }

  render() {
    return this.html`
        <a onclick="${this.launch}"><img src="${this.icon()}" alt="${this.name}" /></a>
    `;
  }
}
