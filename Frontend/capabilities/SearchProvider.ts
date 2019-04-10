import {ResultGroup} from "../components/results/ResultGroup";
import {BaseResult} from "../components/results/BaseResult";
import {ProgressResult} from "../components/results/special/ProgressResult";

export abstract class SearchProvider<ResultType extends BaseResult> {
  // TODO(mbarnathan): Merge groups with the same name?
  public readonly heading: ResultGroup<BaseResult>;
  private readonly progress_result = new ProgressResult("Loading...");

  /**
   * Searches for something and returns a promise that returns results.
   * Not necessarily side-effect free; might temporarily put up a progress bar.
   *
   * @param query the search query
   * @return A Promise with Results for the query.
   */
  public abstract search(query: string): PromiseLike<ResultType[]>;

  /** What to return when there's no query entered. Defaults to nothing. */
  public default(): PromiseLike<ResultType[]> {
    return Promise.resolve([]);
  }

  /**
   * Shows/updates a progress bar in the header.
   * @param percentage percentage from 0 to 100 inclusive, or unspecified for an indefinite spinner.
   */
  public progress(percentage?: number): void;

  /**
   * Shows/updates a progress bar in the header.
   * @param name text to show on the progress bar.
   * @param percentage percentage from 0 to 100 inclusive, or unspecified for an indefinite spinner.
   */
  public progress(text: string, percentage?: number): void;

  public progress(text_or_percentage?: string|number, percentage?: number): void {
    let name = "Loading...";
    if (!percentage && typeof text_or_percentage == "number") {
      percentage = text_or_percentage;
    } else if (typeof text_or_percentage == "string") {
      name = text_or_percentage;
    }
    this.progress_result.name = name;
    this.progress_result.progress = percentage;
    this.heading.replace(this.progress_result);
  }
}
