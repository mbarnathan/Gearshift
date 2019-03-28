import {Action} from "./Action";
import {WebResult} from "../results/WebResult";
import {shell} from "electron";

export class BrowseWebAction extends Action<WebResult> {
  public get name(): string { return "Browse..."; }
  public get icon_filename(): string { return "browse.svg"; }

  public launch(): void {
    shell.openExternal(this.parent.url);
  }
}
