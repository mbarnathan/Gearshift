// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import {SearchResult} from "../components/SearchResult";
import {Results} from "../components/Results";
import {ResultGroup} from "../components/ResultGroup";
import * as Mousetrap from "mousetrap";
import * as $ from "jquery";

const tabs = $("[role='tab']");

tabs.on("focus", function () {
  let tabs = $(this).siblings("[role='tab']");
  tabs.removeClass("active");
  $(this).addClass("active");
});

$(window).on("focus", function() {
  $("#search").focus().select();
});

$(window).on("keydown", function() {
  $("#search").focus();
});

function go(elem: any, selector: any, backwards: boolean) {
  return backwards ? elem.prev(selector) : elem.next(selector);
}

function wrap(elem: any, backwards: boolean) {
  return backwards ? elem.last() : elem.first();
}

function navigateTabs(direction = "right") {
  const backwards = (direction == "left");
  let curFocused = $("#tabs .active");
  let nextFocused = go(curFocused, "[role='tab']", backwards);
  if (nextFocused.length == 0) {
    nextFocused = wrap($("#tabs [role='tab']"), backwards);
  }
  curFocused.removeClass("active");
  nextFocused.addClass("active");
  return false;
}

let results = new Results();
let resultgroup = new ResultGroup();
let result = new SearchResult();
result.filename = "one";
result.path = "/the/one";
result.modified = new Date();
result.size = 1000;
result.service = "Fishbox";

resultgroup.name = "fishsticks";
resultgroup.add(result);
results.add(resultgroup);

results.bind(document.getElementById("result_container"));
results.render();

Mousetrap.bind("shift+tab", () => navigateTabs("left"));
Mousetrap.bind("tab", () => navigateTabs("right"));
