import {Result} from "../Result";
import {Action} from "../../actions/Action";
import {BrowseFileAction, RunFileAction} from "../../actions/FileActions";

export class LocalFileResult extends Result {
  public readonly actions: Action<LocalFileResult>[] = [
      new BrowseFileAction(),
      new RunFileAction()
  ];
}
