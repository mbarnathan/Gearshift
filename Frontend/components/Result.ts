import {Focusable} from "../capabilities/Focusable";
import hyper from "hyperhtml";

export abstract class Result extends hyper.Component implements Focusable {
  id: string;
  protected _focused: boolean;

  public focused(): boolean {
    return this._focused;
  }

  public blur(): void {
    this._focused = false;
  }

  public focus(): void {
    this._focused = true;
  }

  public bind(element: HTMLElement|null) {
    if (element != null) {
      hyper(element)`${this}`;
    }
  }

  abstract render(): HTMLElement;
  abstract navigateDown(): boolean;
  abstract navigateUp(): boolean;
}
