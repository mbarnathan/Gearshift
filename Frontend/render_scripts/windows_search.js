const $ = require("jquery");
const { requireTaskPool } = require('electron-remote');

// TODO: defer until user stops typing for a bit.

const searchWorkers = requireTaskPool(require.resolve('./windows_search_worker'));
function search() {
  let query = $("#search").val();
  searchWorkers.search(query).then(result => console.log(result));
}

$("#search").on("search", search);
