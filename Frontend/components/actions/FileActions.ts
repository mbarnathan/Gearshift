import {Action} from "./Action";
import {LocalFileResult} from "../results/services/LocalFileResult";
import {shell} from "electron";

export abstract class FileAction extends Action<LocalFileResult> {}

export class BrowseFileAction extends FileAction {
  public get name(): string { return "Navigate to..."; }
  public get icon(): string { return "navigate_to.svg"; }

  public launch(): void {
    shell.showItemInFolder(this.parent.path);
  }
}

export class OpenFileAction extends FileAction {
  public get name(): string { return "Open"; }
  public get icon(): string { return "open.svg"; }

  public launch(): void {
    shell.openItem(this.parent.path);
  }
}
