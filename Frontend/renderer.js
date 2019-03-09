// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
$ = require("jquery");

tabs = $("[role='tab']");

tabs.on("focus", function () {
  let tabs = $(this).siblings("[role='tab']");
  tabs.removeClass("active");
  $(this).addClass("active");
});

/*tabs.on("keydown", function(event) {

})*/

