// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import * as Mousetrap from "mousetrap";
import * as $ from "jquery";
import {Result} from "../components/results/Result";
import {ResultBox} from "../components/results/ResultBox";
import {ResultGroup} from "../components/results/ResultGroup";
import {Builder} from "builder-pattern";
import {LocalFileResult} from "../components/results/services/LocalFileResult";
import {SearchMapper} from "../components/SearchMapper";

const tabs = $("[role='tab']");

tabs.on("focus", (evt: JQuery.Event) => {
  let tabs = $(this).siblings("[role='tab']");
  tabs.removeClass("active");
  $(this).addClass("active");
});

$(window).on("focus", (evt: JQuery.Event) => {
  $("#search").focus().select();
});

$(window).on("keydown", (evt: JQuery.Event) => {
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

let results = new ResultBox("Results");
let resultgroup1 = new ResultGroup("fishsticks");
let result = Builder(Result)
    .path("/the/one")
    .name("one")
    .modified(new Date())
    .size(1000)
    .service("Fishbox")
    .build();

let result2 = Builder(Result, result)
    .path("/the/two")
    .name("two")
    .modified(new Date())
    .build();

let result3 = Builder(LocalFileResult, result)
    .path("c:\\temp")
    .name("three")
    .modified(new Date())
    .build();

resultgroup1.add(result, result2);

let resultgroup2 = new ResultGroup("fishy").add(result3);

results.add(resultgroup1);
results.add(resultgroup2);

let searchBox = document.getElementById("search");
if (!searchBox) {
  throw new ReferenceError("Can't find search box with ID 'search'");
}

let mapper = new SearchMapper(searchBox, results);
if (process.platform.startsWith("win")) {
  let winsearch = require("../components/searchproviders/local/windows/WindowsSearch");
  mapper.register(new winsearch.WindowsSearch());
}

results.bind(document.getElementById("result_container"));
results.bindArrowKeys();

Mousetrap.bind("shift+tab", () => navigateTabs("left"));
Mousetrap.bind("tab", () => navigateTabs("right"));
