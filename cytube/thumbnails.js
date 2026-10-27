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

  function getNiconicoId(item) {
    var media = window.jQuery ? window.jQuery(item).data("media") : null;
    var candidates = [];

    if (media) {
      if (media.id) {
        var mediaId = String(media.id);
        var mediaType = String(media.type || "").toLowerCase();
        if (/nico|nicovideo|^nv$|^ni$/.test(mediaType) && /^\d+$/.test(mediaId)) {
          return "sm" + mediaId;
        }
        candidates.push(mediaId);
      }
      if (media.url) candidates.push(String(media.url));
      if (media.link) candidates.push(String(media.link));
    }

    if (item) {
      Array.prototype.forEach.call(item.querySelectorAll("a[href]"), function (a) {
        candidates.push(a.href);
      });
      candidates.push(item.textContent || "");
    }

    for (var i = 0; i < candidates.length; i++) {
      var value = candidates[i];
      var match = value.match(/(?:watch\/|watch\?|nico\.ms\/)?((?:sm|nm|so)\d+)/i);
      if (match && (/nicovideo\.jp|nico\.ms|^(?:sm|nm|so)\d+$/i.test(value) || /(?:sm|nm|so)\d+/i.test(value))) {
        return match[1];
      }
    }
    return null;
  }

  function addNiconicoThumbnails() {
    var queue = document.querySelector("#queue");
    if (!queue) return;

    Array.prototype.forEach.call(queue.querySelectorAll("li"), function (item) {
      if (item.querySelector("img.miniature")) return;

      var id = getNiconicoId(item);
      if (!id) return;

      // This legacy thumbnail endpoint redirects to Niconico's current thumbnail
      // when available. Some videos may not resolve; this is best-effort support.
      var numericId = id.replace(/^(?:sm|nm|so)/i, "");
      if (!/^\d+$/.test(numericId)) return;

      var img = document.createElement("img");
      img.className = "miniature custom-niconico-miniature";
      img.alt = "";
      img.width = 70;
      img.height = 48;
      img.src = "https://tn.smilevideo.jp/smile?i=" + encodeURIComponent(numericId);
      img.onerror = function () {
        if (img.dataset.fallbackTried) {
          img.style.display = "none";
          return;
        }
        img.dataset.fallbackTried = "1";
        img.src = "https://nicovideo.cdn.nimg.jp/thumbnails/" +
          encodeURIComponent(numericId) + "/" + encodeURIComponent(numericId);
      };

      var buttonGroup = item.querySelector(".btn-group");
      if (buttonGroup && !(window.USEROPTS && USEROPTS.qbtn_idontlikechange)) {
        buttonGroup.parentNode.insertBefore(img, buttonGroup);
      } else {
        item.appendChild(img);
      }
    });
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
      addNiconicoThumbnails();

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
