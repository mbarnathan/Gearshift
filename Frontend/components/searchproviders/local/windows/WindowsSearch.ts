import {requireTaskPool} from "electron-remote";
import {LocalFileResult} from "../../../results/services/LocalFileResult";
import {SearchProvider} from "../../../../capabilities/SearchProvider";
import {ResultGroup} from "../../../results/ResultGroup";
import {Builder} from "builder-pattern";

export class WindowsSearch implements SearchProvider<LocalFileResult> {
  readonly heading: ResultGroup<LocalFileResult> = new ResultGroup("Local Files");

  search(query: string): Promise<LocalFileResult[]> {
    console.log("Searching Windows for " + query);
    const searchWorkers = requireTaskPool(require.resolve('./multiprocess_worker'));
    return searchWorkers
        .search(query)
        .then(results => results.map(WindowsSearch.transformResult))
        .then(results => console.log(results));
  }

  private static transformResult(result: Object): LocalFileResult|undefined {
    if (!result) {
      return undefined;
    }

    return Builder(LocalFileResult)
        .name(result["SYSTEM.TITLE"] || result["SYSTEM.ITEMNAME"])
        .mimetype(result["SYSTEM.CONTENTTYPE"])
        .path(result["SYSTEM.ITEMPATHDISPLAY"])
        .size(parseInt(result["SYSTEM.SIZE"]))
        .modified(result["SYSTEM.DATEMODIFIED"])
        .build();
  }
}
