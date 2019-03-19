import {Focusable} from "./Focusable";
import {Renders} from "./Renders";

export abstract class Result implements Focusable, Renders {
  id: string;
  protected _focused;

  public focused(): boolean {
    return this._focused;
  }

  public blur(): void {
    this._focused = false;
  }

  public focus(): void {
    this._focused = true;
  }

  abstract render():string;
  abstract navigateDown(): boolean;
  abstract navigateUp(): boolean;
}
