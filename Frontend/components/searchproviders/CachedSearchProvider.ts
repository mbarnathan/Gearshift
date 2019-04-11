import * as trieMapping from "trie-mapping";
import {BaseResult} from "../results/BaseResult";
import {SearchProvider} from "./SearchProvider";

export abstract class CachedSearchProvider<ResultType extends BaseResult> extends SearchProvider<ResultType> {
  private readonly cached_results;

  constructor() {
    super();
    this.cached_results = trieMapping();
  }

  protected abstract uncachedSearch(query: string): PromiseLike<ResultType[]>;

  public search(query: string): PromiseLike<ResultType[]> {
    console.log("Checking search cache for " + query);
    let searchResults = this.cachedSearch(query);
    if (searchResults) {
      console.log(this.constructor.name + " cache hit for " + query);
    } else {
      console.log(this.constructor.name + " cache miss for " + query);
      searchResults = this.uncachedSearch(query);
      searchResults.then(results => { this.writeCache(query, results); return results });
    }
    return searchResults;
  }

  protected writeCache(query: string, results: ResultType[]) {
    this.cached_results.set(query, results);
  }

  private cachedSearch(query: string): PromiseLike<ResultType[]>|undefined {
    // Prefer the longest cached result.
    let prefixes = this.cached_results.getPrefixesOf(query).sort(
        (a, b) => b[0].length - a[0].length
    );
    if (prefixes.length > 0) {
      return Promise.resolve(prefixes[0][1]);
    }
    return undefined;
  }
}
