import {requireTaskPool} from "electron-remote";
import {LocalFileResult} from "../../../results/services/LocalFileResult";
import {SearchProvider} from "../../../../capabilities/SearchProvider";
import {ResultGroup} from "../../../results/ResultGroup";
import {Builder} from "builder-pattern";
import * as trieMapping from "trie-mapping";

let fs = require("fs");

export class WindowsSearch implements SearchProvider<LocalFileResult> {
  readonly heading: ResultGroup<LocalFileResult> = new ResultGroup("Windows Search");
  readonly cached_results = trieMapping();

  public search(query: string): Promise<LocalFileResult[]> {
    console.log("Checking Windows search cache for " + query);
    let searchResults = this.cachedSearch(query) || this.windowsSearch(query);
    return searchResults;
  }

  public default(): Promise<LocalFileResult[]> {
    return Promise.resolve([]);
  }

  private cachedSearch(query: string): Promise<LocalFileResult[]>|undefined {
    // Prefer the longest cached result.
    let prefixes = this.cached_results.getPrefixesOf(query).sort(
        (a, b) => b[0].length - a[0].length
    );
    if (prefixes.length > 0) {
      console.log("Windows cache hit for " + query);
      return Promise.resolve(prefixes[0][1]);
    }
    return undefined;
  }

  private windowsSearch(query: string): Promise<LocalFileResult[]> {
    console.log("Cache miss; really searching Windows for " + query);
    const searchWorkers = requireTaskPool(require.resolve('./multiprocess_worker'));

    let transformAndCache = searchResults => {
      let transformed = searchResults.map(WindowsSearch.transformResult);
      this.cached_results.set(query, transformed);
      return transformed;
    };

    return searchWorkers
        .search(query)
        .then(transformAndCache)
        .then(r => { console.debug(r); return r});
  }

  private static transformResult(result: Object): LocalFileResult|undefined {
    if (!result) {
      return undefined;
    }

    // TODO(mb): Look into parallelizing or deferring stats if slow.
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
