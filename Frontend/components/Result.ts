import {Focusable} from "./Focusable";
import {Renders} from "./Renders";
import {render as _render, TemplateResult} from "lit-html";

export abstract class Result implements Focusable, Renders {
  id: string;
  bound_element: HTMLElement = null;
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

  abstract template(): TemplateResult;
  abstract navigateDown(): boolean;
  abstract navigateUp(): boolean;

  public render(): void {
    if (!this.bound_element) {
      return;
    }
    _render(this.template(), this.bound_element);
  }


  bind(element: HTMLElement): void {
    this.bound_element = element;
  }
}
