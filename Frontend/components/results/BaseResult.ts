import {Actionable} from "../../capabilities/Actionable";
import {Focusable} from "../../capabilities/Focusable";
import hyper from "hyperhtml";
import {Action} from "../Action";

export abstract class BaseResult extends hyper.Component implements Focusable, Actionable {
  id: string;

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

  abstract render(): HTMLElement;
  abstract navigateDown(): boolean;
  abstract navigateUp(): boolean;
  abstract navigate(wrap: Function, proceed: Function): boolean;
  abstract actions(context?: Context): Action[];
}
