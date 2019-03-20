import {Focusable} from "../capabilities/Focusable";
import {Renders} from "../capabilities/Renders";

export abstract class Result implements Focusable, Renders {
  id: string;
  bound_element: HTMLElement|null = null;
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

  abstract template(): HTMLElement;
  abstract navigateDown(): boolean;
  abstract navigateUp(): boolean;

  public render(): void {
    if (!this.bound_element) {
      return;
    }
    this.bound_element.appendChild(this.template());
  }

  public bind(element: HTMLElement|null): void {
    this.bound_element = element;
  }
}
