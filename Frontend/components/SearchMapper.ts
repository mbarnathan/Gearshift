import {SearchProvider} from "../capabilities/SearchProvider";
import {ResultGroup} from "./results/ResultGroup";
import * as $ from "jquery";

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
    for (let searcher of this.searchers) {
      searcher.search(query).then(result => {
        searcher.heading.replace(...result);
        searcher.heading.highlight(query);
      });
    }
  }
}
