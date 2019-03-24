import hyper from "hyperhtml";
import {Result} from "../results/Result";

export abstract class Action<ResultType extends Result> extends hyper.Component {
  protected constructor(public readonly name: string,
                        protected readonly action_icon?: string) {
    super();
  }

  get defaultState() {
    return {
      visible: true
    };
  }

  public icon(): string {
    return (this.action_icon) ? ("themes/default/icons/actions/" + this.action_icon) : "";
  }

  public get visible(): boolean {
    return this.state["visible"];
  }

  public set visible(visible: boolean) {
    this.state["visible"] = visible;
  }

  public abstract launch(context: ResultType): void;

  public render() {
    return this.state["visible"]
        ? this.html`<li><a onclick="${this.launch}"><img src="${this.icon()}" alt="${this.name}" /></a></li>`
        : this.html``;
  }
}
