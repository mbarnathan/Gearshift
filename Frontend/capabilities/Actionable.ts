import {Action} from "../components/actions/Action";

export interface Actionable {
  actions: Action<any>[];
}
