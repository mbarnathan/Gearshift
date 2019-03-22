import {Focusable} from "../capabilities/Focusable";
import hyper from "hyperhtml";

export abstract class Result extends hyper.Component implements Focusable {
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
}
