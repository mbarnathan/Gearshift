import {Action} from "./Action";
import {LocalFileResult} from "../results/services/LocalFileResult";
import {shell} from "electron";
import * as touch from "touch";

export abstract class FileAction extends Action<LocalFileResult> {}

export class BrowseFileAction extends FileAction {
  public get name(): string { return "Navigate to..."; }
  public get icon_filename(): string { return "navigate_to.svg"; }

  public launch(): void {
    shell.showItemInFolder(this.parent.path);
  }
}

export class OpenFileAction extends FileAction {
  public get name(): string { return "Open"; }
  public get icon_filename(): string { return "navigate_to.svg"; }

  public launch(): void {
    // noinspection JSIgnoredPromiseFromCall
    touch(this.parent.path, {"atime": true, "mtime": false});
    shell.openItem(this.parent.path);
  }
}
