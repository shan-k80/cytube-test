(function () {
  "use strict";

  var STYLE_ID = "custom-playlist-thumbnails-style-v2";
  var observer = null;
  var applying = false;
  var retryCount = 0;

  function addStyles() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent =
      "#queue img.miniature, #queue .miniature {" +
      "width:70px !important; height:48px !important;" +
      "min-width:70px !important; min-height:48px !important;" +
      "max-width:70px !important; max-height:48px !important;" +
      "object-fit:cover !important; box-sizing:border-box !important;" +
      "}";
  }

  function forceImageSize(img) {
    if (!img || !img.classList || !img.classList.contains("miniature")) return;
    img.setAttribute("width", "70");
    img.setAttribute("height", "48");
    img.style.setProperty("width", "70px", "important");
    img.style.setProperty("height", "48px", "important");
    img.style.setProperty("min-width", "70px", "important");
    img.style.setProperty("min-height", "48px", "important");
    img.style.setProperty("max-width", "70px", "important");
    img.style.setProperty("max-height", "48px", "important");
    img.style.setProperty("object-fit", "cover", "important");
  }

  function findNiconicoId(item) {
    var media = window.jQuery ? window.jQuery(item).data("media") : null;
    var candidates = [];
    var mediaType = "";

    if (media && typeof media === "object") {
      mediaType = String(media.type || media.provider || "").toLowerCase();
      if (media.id !== undefined && media.id !== null) candidates.push(String(media.id));
      if (media.url) candidates.push(String(media.url));
      if (media.link) candidates.push(String(media.link));
      if (media.src) candidates.push(String(media.src));
    }

    if (item) {
      ["href", "data-url", "data-link", "title"].forEach(function (attr) {
        var value = item.getAttribute && item.getAttribute(attr);
        if (value) candidates.push(value);
      });
      Array.prototype.forEach.call(item.querySelectorAll("a[href], [data-url], [data-link]"), function (el) {
        ["href", "data-url", "data-link", "title"].forEach(function (attr) {
          var value = el.getAttribute(attr);
          if (value) candidates.push(value);
        });
      });
      candidates.push(item.textContent || "");
      candidates.push(item.innerHTML || "");
    }

    for (var i = 0; i < candidates.length; i++) {
      var value = String(candidates[i]);
      var match = value.match(/(?:watch\/|watch\?|nico\.ms\/|nicovideo\.jp\/watch\/|^)((?:sm|nm|so)\d+)/i);
      if (match) return match[1].toLowerCase();
      // Some CyTube media records keep the numeric ID separately from the URL.
      if (/nico|nicovideo|^nv$|^ni$/.test(mediaType) && /^\d+$/.test(value)) {
        return "sm" + value;
      }
    }
    return null;
  }

  function insertNiconicoThumbnail(item, id) {
    var numericId = id.replace(/^(?:sm|nm|so)/i, "");
    if (!/^\d+$/.test(numericId)) return;

    var img = document.createElement("img");
    img.className = "miniature custom-niconico-miniature";
    img.alt = "";
    img.loading = "lazy";
    forceImageSize(img);

    var sources = [
      "https://tn.smilevideo.jp/smile?i=" + encodeURIComponent(numericId),
      "https://nicovideo.cdn.nimg.jp/thumbnails/" + encodeURIComponent(numericId) + "/" + encodeURIComponent(numericId),
      "https://tn-skr3.smilevideo.jp/smile?i=" + encodeURIComponent(numericId)
    ];
    var sourceIndex = 0;
    img.onerror = function () {
      sourceIndex++;
      if (sourceIndex < sources.length) img.src = sources[sourceIndex];
      else img.style.setProperty("display", "none", "important");
    };
    img.src = sources[sourceIndex];

    var buttonGroup = item.querySelector(".btn-group");
    if (buttonGroup && !(window.USEROPTS && window.USEROPTS.qbtn_idontlikechange)) {
      buttonGroup.parentNode.insertBefore(img, buttonGroup);
    } else {
      item.appendChild(img);
    }
    forceImageSize(img);
  }

  function addNiconicoThumbnails() {
    var queue = document.querySelector("#queue");
    if (!queue) return;

    Array.prototype.forEach.call(queue.querySelectorAll("li.queue_entry, li"), function (item) {
      if (item.querySelector("img.custom-niconico-miniature")) return;

      var id = findNiconicoId(item);
      if (!id) return;

      // Do not duplicate thumbnails already made by Synchtube Premium.
      if (item.querySelector("img.miniature")) return;
      insertNiconicoThumbnail(item, id);
    });
  }

  function applyThumbnails() {
    if (applying) return;
    if (typeof queueMiniatures !== "function" || typeof $queue === "undefined" || !$queue.length) return;

    applying = true;
    try {
      if (typeof MINIATURES !== "undefined") MINIATURES = true;
      if (observer) observer.disconnect();

      // Rebuild the standard YouTube/Dailymotion thumbnails, then add best-effort Nico support.
      $queue.find("img.miniature").remove();
      queueMiniatures("show");
      addNiconicoThumbnails();

      // Apply the dimensions directly as well as through CSS, overriding existing styles.
      var queue = document.querySelector("#queue");
      if (queue) Array.prototype.forEach.call(queue.querySelectorAll("img.miniature"), forceImageSize);

      document.querySelectorAll("#pls-10").forEach(function (el) {
        var menuItem = el.closest("li");
        if (menuItem) menuItem.style.display = "none";
        else el.style.display = "none";
      });
    } catch (e) {
      // If Premium is still initializing, the retry loop will try again.
    } finally {
      var queueAfter = document.querySelector("#queue");
      if (observer && queueAfter) observer.observe(queueAfter, { childList: true, subtree: true });
      applying = false;
    }
  }

  function start() {
    addStyles();
    var queue = document.querySelector("#queue");
    if (queue && !observer && window.MutationObserver) {
      observer = new MutationObserver(function (mutations) {
        var queueChanged = mutations.some(function (mutation) {
          return Array.prototype.some.call(mutation.addedNodes, function (node) {
            return node.nodeType === 1 && !(node.matches && node.matches("img.miniature"));
          }) || Array.prototype.some.call(mutation.removedNodes, function (node) {
            return node.nodeType === 1 && !(node.matches && node.matches("img.miniature"));
          });
        });
        if (queueChanged) applyThumbnails();
      });
      observer.observe(queue, { childList: true, subtree: true });
    }
    applyThumbnails();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  var retry = window.setInterval(function () {
    retryCount++;
    addStyles();
    applyThumbnails();
    if (retryCount >= 60) window.clearInterval(retry);
  }, 500);
})();
