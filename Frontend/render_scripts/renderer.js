// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import {Result} from "../components/result";
import {Results} from "../components/results";
import {ResultGroup} from "../components/result_group";

const $ = require("jquery");
const Mousetrap = require("mousetrap");
const React = require("react");
const ReactDOM = require("react-dom");

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

function go(elem, selector, backwards) {
  return backwards ? elem.prev(selector) : elem.next(selector);
}

function wrap(elem, backwards) {
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

function onResultsReady(resultsComponent) {
  window.results = resultsComponent;
  resultsComponent.bindArrowKeys();
}

ReactDOM.render(
    <Results id="results" ref={onResultsReady}>
      <ResultGroup id="fish" name="fishsticks">
        <Result filename="one" path="/the/one" modified="1970-01-01 12:00:00 AM" size="1000" service="Fishbox" />
      </ResultGroup>
    </Results>,
    document.getElementById("result_container")
);

Mousetrap.bind("shift+tab", () => navigateTabs("left"));
Mousetrap.bind("tab", () => navigateTabs("right"));
