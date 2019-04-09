import {Action} from "../actions/Action";
import {Focusable} from "../../capabilities/Focusable";
import hyper from "hyperhtml";
import * as _ from "lodash";
import {CanHide} from "../../capabilities/CanHide";

export abstract class BaseResult extends hyper.Component implements Focusable, CanHide {
  public name: string;
  public element: HTMLElement;
  public readonly actions: Action<any>[];

  get defaultState() {
    return {
      focused: false,
      visible: true,
      actions: this.actions
    };
  }

  public get visible(): boolean {
    return this.state["visible"];
  }

  public set visible(show: boolean) {
    this.setState({visible: show});
  }

  public get id():string {
    return "results_" + _.snakeCase(this.name);
  }

  public score(query: string): number {
    return (this.name.toLocaleLowerCase().startsWith(query.toLocaleLowerCase()) ||
        new RegExp(`${query}`, "iu").test(this.name))
        ? 1.0
        : 0.0;
  }

  public focused(): boolean {
    return this.state["focused"];
  }

  public blur(): void {
    this.setState({focused: false});
  }

  public focus(): void {
    this.setState({focused: true});
  }

  /** Take the default (first) action on this element. */
  public activate(): void {
    if (this.actions) {
      this.actions[0].launch();
    }
  }

  public bind(element: HTMLElement|null) {
    if (element != null) {
      hyper(element)`${this}`;
      this.element = element;
    }
  }

  public render(): HTMLElement {
    return this.visible ? this.renderIfVisible() : this.html``;
  }

  public abstract renderIfVisible(): HTMLElement;
  public abstract navigateDown(): boolean;
  public abstract navigateUp(): boolean;
  public abstract navigate(wrap: Function, proceed: Function): boolean;
  public abstract highlight(query: string): void;
}
