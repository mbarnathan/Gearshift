export interface Renders {
  bound_element: HTMLElement | null;

  template(): any;
  bind(element: HTMLElement): void;
  render(): void;
}
