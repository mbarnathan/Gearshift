import {ResultGroup} from "../components/results/ResultGroup";
import {BaseResult} from "../components/results/BaseResult";

export interface SearchProvider<ResultType extends BaseResult> {
  // TODO(mbarnathan): Merge groups with the same name?

  readonly heading: ResultGroup<ResultType>;
  search(query: string): Promise<ResultType[]>;

  // What to return when there's no query entered.
  default(): Promise<ResultType[]>;
}
