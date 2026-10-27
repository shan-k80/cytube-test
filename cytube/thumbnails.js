(function () {
  "use strict";

  var STYLE_ID = "custom-playlist-thumbnails-style";
  var observer = null;
  var applying = false;

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "#queue img.miniature {" +
      "width: 90px !important;" +
      "height: 68px !important;" +
      "max-width: 90px !important;" +
      "max-height: 68px !important;" +
      "object-fit: cover;" +
      "}";
    document.head.appendChild(style);
  }

  function applyThumbnails() {
    if (applying) return;
    if (typeof queueMiniatures !== "function" ||
        typeof rebuildMiniatures !== "function" ||
        typeof $queue === "undefined" ||
        !$queue.length) {
      return;
    }

    applying = true;
    try {
      // Turn on the Premium thumbnail flag and generate thumbnails for current items.
      if (typeof MINIATURES !== "undefined") MINIATURES = true;

      if (observer) observer.disconnect();

      // Remove existing thumbnails first to prevent duplicates.
      $queue.find("img.miniature").remove();
      queueMiniatures("show");

      // Hide the thumbnail toggle so it cannot be switched off from the menu.
      document.querySelectorAll("#pls-10").forEach(function (el) {
        var menuItem = el.closest("li");
        if (menuItem) menuItem.style.display = "none";
        else el.style.display = "none";
      });
    } catch (e) {
      // If Premium is still initializing, a later retry will apply the changes.
    } finally {
      if (observer && document.querySelector("#queue")) {
        observer.observe(document.querySelector("#queue"), {
          childList: true,
          subtree: true
        });
      }
      applying = false;
    }
  }

  function start() {
    addStyles();

    var queue = document.querySelector("#queue");
    if (queue && !observer && window.MutationObserver) {
      observer = new MutationObserver(function (mutations) {
        // Ignore changes consisting only of thumbnail images.
        var queueChanged = mutations.some(function (mutation) {
          return Array.prototype.some.call(mutation.addedNodes, function (node) {
            return node.nodeType === 1 &&
              !(node.matches && node.matches("img.miniature")) &&
              !(node.querySelector && node.querySelector("img.miniature"));
          }) || Array.prototype.some.call(mutation.removedNodes, function (node) {
            return node.nodeType === 1 &&
              !(node.matches && node.matches("img.miniature")) &&
              !(node.querySelector && node.querySelector("img.miniature"));
          });
        });

        if (queueChanged) applyThumbnails();
      });
      observer.observe(queue, { childList: true, subtree: true });
    }

    applyThumbnails();
  }

  // Wait for Synchtube Premium to finish loading, regardless of script order.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  var attempts = 0;
  var retry = window.setInterval(function () {
    attempts++;
    addStyles();
    applyThumbnails();

    if (attempts >= 60) window.clearInterval(retry);
  }, 500);
})();
