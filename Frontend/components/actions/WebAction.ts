import {Action} from "./Action";

export class WebAction extends Action {
  public constructor(name: string, public readonly url:string, action_icon: string) {
    super(name, action_icon);
  }

  public launch(context?: Context): void {
    require("shell").openExternal(this.url);
  }
}
