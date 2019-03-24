import hyper from "hyperhtml";

export abstract class Action extends hyper.Component {
  protected constructor(public readonly name: string, protected readonly action_icon?: string) {
    super();
  }

  public icon(): string {
    return (this.action_icon) ? ("themes/default/icons/actions/" + this.action_icon) : "";
  }

  public visible(): boolean {
    return this.icon().length > 0;
  }

  public abstract launch(context?: Context): void;

  public render() {
    return this.visible()
        ? this.html`<a onclick="${this.launch}"><img src="${this.icon()}" alt="${this.name}" /></a>`
        : this.html``;
  }
}
