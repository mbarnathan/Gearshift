import {Action} from "../actions/Action";
import {Focusable} from "../../capabilities/Focusable";
import hyper from "hyperhtml";
import * as _ from "lodash";

export abstract class BaseResult extends hyper.Component implements Focusable {
  public name: string;
  public element: HTMLElement;
  public readonly actions: Action<any>[];

  get defaultState() {
    return {
      focused: false,
      actions: this.actions
    };
  }

  public get id():string {
    return "results_" + _.snakeCase(this.name);
  }

  public score(query: string): number {
    return !query || (this.name.toLocaleLowerCase().startsWith(query.toLocaleLowerCase()) ||
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

  public abstract render(): HTMLElement;
  public abstract navigateDown(): boolean;
  public abstract navigateUp(): boolean;
  public abstract navigate(wrap: Function, proceed: Function): boolean;
  public abstract highlight(query: string): void;
}
