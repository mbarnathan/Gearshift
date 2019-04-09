import {SearchProvider} from "../capabilities/SearchProvider";
import {ResultGroup} from "./results/ResultGroup";
import * as $ from "jquery";
import * as _ from "lodash";
import {BaseResult} from "./results/BaseResult";

export class SearchMapper {
  private searchers = new Set<SearchProvider<any>>();

  constructor(readonly searchInput: HTMLElement, readonly parent: ResultGroup<any>) {
    $(searchInput).on("search", (evt: JQuery.Event) => this.search(evt));
    $(searchInput).on("input", (evt: JQuery.Event) => this.highlight(evt));
  }

  register(searcher: SearchProvider<any>): SearchMapper {
    this.parent.add(searcher.heading);
    this.searchers.add(searcher);
    return this;
  }

  private static score(results: BaseResult[], query: string) {
    // We go through some lengths here to run score() only once - it can be expensive.
    let scores = new Array();
    for (let result of results) {
      if (!result) { continue; }
      let score = result.score(query);
      if (score > 0) {
        scores.push([result, score]);
      }
    }

    // Stable sort in descending order of score.
    // In binary scoring cases, the scores are all ones (because 0s have been filtered).
    // The default Javascript sort algorithm, TimSort, handles this case in linear time.
    scores = scores.sort((a, b) => b[1] - a[1]);
    return _.unzip(scores);
  }

  private static populate(heading: ResultGroup<any>, results: BaseResult[], query: string) {
    let [sorted, scores] = SearchMapper.score(results, query);
    console.debug("Populating " + heading.id + " with " + _.map(sorted, "id"));
    heading.replace(...sorted);
    heading.highlight(query);
  }

  private highlight(event: JQuery.Event) {
    let query = ($(this.searchInput).val() || "").toString();
    this.parent.highlight(query);
  }

  private search(event: JQuery.Event) {
    let query = ($(this.searchInput).val() || "").toString();
    if (!query) {
      return;
    }
    console.log("Searching for " + query);
    let promises: Promise<void>[] = [...this.searchers].map(
        searcher => searcher
            .search(query)
            .then(results => SearchMapper.populate(searcher.heading, results, query))
    );

    /*
    // Once all searchers are done, sort their headers within the parent.
    Promise.all(promises).then(() => SearchMapper.populate(
        this.parent, [...this.searchers].map(s => s.heading), query)
    );*/
  }
}
