import {Action} from "./Action";
import {LocalFileResult} from "../results/services/LocalFileResult";

export abstract class FileAction extends Action<LocalFileResult> {}

export class BrowseFileAction extends FileAction {
  constructor() {
    super("Browse to...", "browse.svg");
  }

  public launch(context: LocalFileResult): void {
    require("shell").showItemInFolder(context.path);
  }
}

export class RunFileAction extends FileAction {
  constructor() {
    super("Run", "run.svg");
  }

  public launch(context: LocalFileResult): void {
    require("shell").openItem(context.path);
  }
}
