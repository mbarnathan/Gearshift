import * as $ from "jquery";
import { requireTaskPool } from "electron-remote";
import {LocalFileResult} from "../components/results/services/LocalFileResult";
import {Builder} from "builder-pattern";

const searchWorkers = requireTaskPool(require.resolve('./windows_search_worker'));
function search() {
  let query = $("#search").val();
  return searchWorkers.search(query).then(results => console.log(results["result"][0].map(transformResult)));
}

function transformResult(result: Object): LocalFileResult|undefined {
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

$("#search").on("search", search);
