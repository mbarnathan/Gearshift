import {Action} from "../Actions/Action";
import {Actionable} from "../../capabilities/Actionable";
import {Focusable} from "../../capabilities/Focusable";
import hyper from "hyperhtml";

export abstract class BaseResult extends hyper.Component implements Focusable, Actionable {
  public id: string;

  get defaultState() {
    return {focused: false};
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
  public abstract actions(context?: Context): Action[];
}
