import {TemplateResult} from "lit-html";

export interface Renders {
  bound_element: HTMLElement | null;

  template(): TemplateResult;
  bind(element: HTMLElement): void;
  render(): void;
}
