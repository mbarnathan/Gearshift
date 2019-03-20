import * as $ from "jquery";
import { requireTaskPool } from "electron-remote";

const searchWorkers = requireTaskPool(require.resolve('./windows_search_worker'));
function search() {
  let query = $("#search").val();
  return searchWorkers.search(query).then(result => console.log(result));
}

$("#search").on("search", search);