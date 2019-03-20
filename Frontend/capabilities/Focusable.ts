export interface Focusable {
  focus(): void;
  blur(): void;
  focused(): boolean;
  navigateUp(): boolean;
  navigateDown(): boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}
