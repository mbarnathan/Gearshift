import * as $ from "jquery";
import {requireTaskPool} from "electron-remote";

const searchWorkers = requireTaskPool(require.resolve('./windows_search_worker'));
function search() {
  let query = $("#search").val();
  return searchWorkers.search(query);
}

$("#search").on("search", search);
