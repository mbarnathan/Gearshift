import {Result} from "../Result";
import {Action} from "../../actions/Action";
import {BrowseFileAction, RunFileAction} from "../../actions/FileActions";

export class LocalFileResult extends Result {
  public get actions(): Action<LocalFileResult>[] {
    return [
      new BrowseFileAction(this),
      new RunFileAction(this)
    ];
  }
}
