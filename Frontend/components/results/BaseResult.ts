import {Action} from "../actions/Action";
import {Focusable} from "../../capabilities/Focusable";
import hyper from "hyperhtml";

export abstract class BaseResult extends hyper.Component implements Focusable {
  public id: string;

  public constructor() {
    super();
  }

  public get actions(): Action<any>[] {
    return [];
  }

  get defaultState() {
    return {
      focused: false,
      actions: this.actions
    };
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
