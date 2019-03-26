import {Action} from "../actions/Action";
import {Focusable} from "../../capabilities/Focusable";
import hyper from "hyperhtml";
import * as _ from "lodash";

export abstract class BaseResult extends hyper.Component implements Focusable {
  public name: string;
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

  public matches(query: string): boolean {
    return this.name.toLocaleLowerCase().startsWith(query.toLocaleLowerCase());
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

  public bind(element: HTMLElement|null) {
    if (element != null) {
      hyper(element)`${this}`;
    }
  }

  public abstract render(): HTMLElement;
  public abstract navigateDown(): boolean;
  public abstract navigateUp(): boolean;
  public abstract navigate(wrap: Function, proceed: Function): boolean;
}
