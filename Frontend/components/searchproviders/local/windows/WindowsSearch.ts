import {requireTaskPool} from "electron-remote";
import {LocalFileResult} from "../../../results/services/LocalFileResult";
import {ResultGroup} from "../../../results/ResultGroup";
import {Builder} from "builder-pattern";
import {CachedSearchProvider} from "../../CachedSearchProvider";

let fs = require("fs");

export class WindowsSearch extends CachedSearchProvider<LocalFileResult> {
  public readonly heading: ResultGroup<LocalFileResult> = new ResultGroup("Windows Search");

  protected uncachedSearch(query: string): PromiseLike<LocalFileResult[]> {
    if (!query) {
      return Promise.resolve([]);
    }

    this.progress();

    const searchWorkers = requireTaskPool(require.resolve('./multiprocess_worker'));
    let transformAndCache = searchResults => searchResults.map(WindowsSearch.transformResult);

    return searchWorkers
        .search(query)
        .then(transformAndCache)
        .then(r => { console.debug(r); return r});
  }

  private static transformResult(result: Object): LocalFileResult|undefined {
    if (!result) {
      return undefined;
    }

    // This appears to happen faster sequentially than asynchronously.
    let stat;
    try {
      stat = fs.statSync(result["SYSTEM.ITEMPATHDISPLAY"]);
    } catch (err) {
      // File doesn't exist or no permissions.
      return undefined;
    }

    // Start with the data from the index, but it might be out of date.
    let fileProps = Builder(LocalFileResult)
        .name(result["SYSTEM.TITLE"] || result["SYSTEM.ITEMNAMEDISPLAY"] || result["SYSTEM.ITEMNAME"])
        .mimetype(result["SYSTEM.MIMETYPE"])
        .path(result["SYSTEM.ITEMPATHDISPLAY"])
        .size(parseInt(result["SYSTEM.SIZE"]))
        .modified(result["SYSTEM.DATEMODIFIED"])
        .accessed(result["SYSTEM.DATEACCESSED"])
        .properties(result);

    // Update with the live stat data.
    if (stat.atimeMs) { fileProps.accessed(new Date(stat.atimeMs)) }
    if (stat.mtimeMs) { fileProps.modified(new Date(stat.mtimeMs)) }
    if (stat.size) { fileProps.size(stat.size) }
    return fileProps.build();
  }
}
