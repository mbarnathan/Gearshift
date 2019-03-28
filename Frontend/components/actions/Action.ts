import hyper from "hyperhtml";
import {Result} from "../results/Result";
import * as _ from "lodash";

export abstract class Action<ResultType extends Result> extends hyper.Component {
  protected _name?: string;

  public constructor(protected readonly parent: ResultType) {
    super();
    console.assert(this.parent);
  }

  get defaultState() {
    return {
      visible: true
    };
  }

  public get icon_filename(): string {
    return "";
  }

  public get icon(): string {
    let icon_name = this.icon_filename;
    return (icon_name) ? ("themes/default/icons/actions/" + icon_name) : "";
  }

  public get name(): string {
    return this._name || _.startCase(this.constructor.name.replace(/Action$/, ""));
  }

  public get visible(): boolean {
    return this.state["visible"];
  }

  public set visible(visible: boolean) {
    this.state["visible"] = visible;
  }

  public abstract launch(): void;

  onclick() {
    this.launch();
    return true;
  }

  public render() {
    return this.state["visible"]
        ? this.html`<li><a onclick="${this}"><img src="${this.icon}" alt="${this.name}" /></a></li>`
        : this.html``;
  }
}
