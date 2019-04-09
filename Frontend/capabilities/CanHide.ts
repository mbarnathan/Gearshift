export interface CanHide {
  visible: boolean;
  onShow?: () => void;
  onHide?: () => void;
}
