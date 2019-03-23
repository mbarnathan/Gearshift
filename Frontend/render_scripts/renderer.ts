// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import {SearchResult} from "../components/results/SearchResult";
import {ResultBox} from "../components/results/ResultBox";
import {ResultGroup} from "../components/results/ResultGroup";
import {Builder} from "builder-pattern";
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

let results = new ResultBox();
let resultgroup1 = new ResultGroup();
let result = Builder(SearchResult)
    .path("/the/one")
    .filename("one")
    .modified(new Date())
    .size(1000)
    .service("Fishbox")
    .build();

let result2 = Builder(SearchResult, result)
    .path("/the/two")
    .filename("two")
    .modified(new Date())
    .build();

let result3 = Builder(SearchResult, result)
    .path("/the/three")
    .filename("three")
    .modified(new Date())
    .build();

resultgroup1.name = "fishsticks";
resultgroup1.add(result, result2);

let resultgroup2 = new ResultGroup();
resultgroup2.name = "fishy";
resultgroup2.add(result3);

results.add(resultgroup1);
results.add(resultgroup2);

results.bind(document.getElementById("result_container"));
results.bindArrowKeys();

Mousetrap.bind("shift+tab", () => navigateTabs("left"));
Mousetrap.bind("tab", () => navigateTabs("right"));
