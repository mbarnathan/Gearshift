import {requireTaskPool} from "electron-remote";
import {LocalFileResult} from "../../../results/services/LocalFileResult";
import {SearchProvider} from "../../../../capabilities/SearchProvider";
import {ResultGroup} from "../../../results/ResultGroup";
import {Builder} from "builder-pattern";
import * as trieMapping from "trie-mapping";

export class WindowsSearch implements SearchProvider<LocalFileResult> {
  readonly heading: ResultGroup<LocalFileResult> = new ResultGroup("Local Files");
  readonly cached_results = trieMapping();

  public search(query: string): Promise<LocalFileResult[]> {
    console.log("Searching Windows for " + query);
    let searchResults = this.cachedSearch(query) || this.windowsSearch(query);
    return searchResults.then(results => results.filter(r => r.matches(query)));
  }

  private cachedSearch(query: string): Promise<LocalFileResult[]>|undefined {
    // Prefer the longest cached result.
    let prefixes = this.cached_results.getPrefixesOf(query).sort(
        (a, b) => b[0].length - a[0].length
    );
    if (prefixes.length > 0) {
      console.log("Found cached prefixes: " + prefixes.map(p => p[0]));
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
        .then(transformAndCache);
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
