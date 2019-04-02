import {Result} from "../Result";
import {Action} from "../../actions/Action";
import {BrowseFileAction, OpenFileAction} from "../../actions/FileActions";

export class LocalFileResult extends Result {
  public readonly actions: Action<LocalFileResult>[] = [
    new OpenFileAction(this),
    new BrowseFileAction(this)
  ];
}
