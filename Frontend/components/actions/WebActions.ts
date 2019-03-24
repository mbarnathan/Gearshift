import {Action} from "./Action";
import {WebResult} from "../results/WebResult";

export class BrowseWebAction extends Action<WebResult> {
  constructor() {
    super("Browse...", "browse.svg");
  }

  public launch(context: WebResult): void {
    require("shell").openExternal(context.url);
  }
}
