import {Action} from "../components/Action";

export interface Actionable {
  actions(context?: Context): Action[];
}
