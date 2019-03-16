// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const $ = require("jquery");
const Mousetrap = require("mousetrap");

tabs = $("[role='tab']");

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

function focusResult(resultRow) {
  let curFocused = $("#results .active");
  curFocused.removeClass("active");
  resultRow.addClass("active");
}

function navigateResults(direction = "down") {
  const backwards = (direction == "up");

  let curFocused = $("#results .active");
  let nextFocused = go(curFocused, "tr", backwards);
  if (nextFocused.length == 0 || nextFocused.children("td").length == 0) {
    // Jump to next section.
    nextFocused = wrap(go(curFocused.parent(), "tbody", backwards).find("td"), backwards).parent();
  }

  if (nextFocused.length == 0) {
    nextFocused = wrap($("#results td"), backwards).parent();
  }

  focusResult(nextFocused);
  return false;
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

Mousetrap.bind("up", () => navigateResults("up"));
Mousetrap.bind("down", () => navigateResults("down"));
Mousetrap.bind("shift+tab", () => navigateTabs("left"));
Mousetrap.bind("tab", () => navigateTabs("right"));
