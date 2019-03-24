import {Result} from "./Result";
import {Action} from "../actions/Action";
import {BrowseWebAction} from "../actions/WebActions";

export class WebResult extends Result {
  public url: string;

  public readonly actions: Action<WebResult>[] = [
    new BrowseWebAction()
  ];
}
