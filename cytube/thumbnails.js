(function () {
  "use strict";

  var STYLE_ID = "custom-playlist-thumbnails-style-v4";
  var observer = null;
  var initialized = false;
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
      "width:40px !important;height:27px !important;" +
      "min-width:40px !important;min-height:27px !important;" +
      "max-width:40px !important;max-height:27px !important;" +
      "object-fit:cover !important;box-sizing:border-box !important;" +
      "}";
  }

  function forceImageSize(img) {
    if (!img || !img.classList || !img.classList.contains("miniature")) return;
    img.setAttribute("width", "40");
    img.setAttribute("height", "27");
    img.style.setProperty("width", "40px", "important");
    img.style.setProperty("height", "27px", "important");
    img.style.setProperty("min-width", "40px", "important");
    img.style.setProperty("min-height", "27px", "important");
    img.style.setProperty("max-width", "40px", "important");
    img.style.setProperty("max-height", "27px", "important");
    img.style.setProperty("object-fit", "cover", "important");
  }

  function findNiconicoId(item) {
    var media = window.jQuery ? window.jQuery(item).data("media") : null;
    var candidates = [];
    var mediaType = "";

    if (media && typeof media === "object") {
      mediaType = String(media.type || media.provider || "").toLowerCase();
      [media.id, media.url, media.link, media.src].forEach(function (value) {
        if (value !== undefined && value !== null) candidates.push(String(value));
      });
    }

    [item].concat(Array.prototype.slice.call(item.querySelectorAll("a[href], [data-url], [data-link]"))).forEach(function (el) {
      ["href", "data-url", "data-link", "title"].forEach(function (attr) {
        var value = el.getAttribute && el.getAttribute(attr);
        if (value) candidates.push(value);
      });
    });
    candidates.push(item.textContent || "");

    for (var i = 0; i < candidates.length; i++) {
      var value = String(candidates[i]);
      var match = value.match(/(?:watch\/|watch\?|nico\.ms\/|nicovideo\.jp\/watch\/|^)((?:sm|nm|so)\d+)/i);
      if (match) return match[1].toLowerCase();
      if (/nico|nicovideo|^nv$|^ni$/.test(mediaType) && /^\d+$/.test(value)) return "sm" + value;
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
      "https://tn-skr3.smilevideo.jp/smile?i=" + encodeURIComponent(numericId),
      "https://nicovideo.cdn.nimg.jp/thumbnails/" + encodeURIComponent(numericId) + "/" + encodeURIComponent(numericId)
    ];
    var sourceIndex = 0;
    img.onerror = function () {
      sourceIndex++;
      if (sourceIndex < sources.length) img.src = sources[sourceIndex];
      else img.style.setProperty("display", "none", "important");
    };
    img.src = sources[sourceIndex];

    var buttonGroup = item.querySelector(".btn-group");
    if (buttonGroup && buttonGroup.parentNode && !(window.USEROPTS && window.USEROPTS.qbtn_idontlikechange)) {
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
      // Do not add a second image if Premium already supplied one.
      if (item.querySelector("img.miniature")) return;
      insertNiconicoThumbnail(item, id);
    });
  }

  function hideThumbnailToggle() {
    document.querySelectorAll("#pls-10").forEach(function (el) {
      var menuItem = el.closest("li");
      if (menuItem) menuItem.style.display = "none";
      else el.style.display = "none";
    });
  }

  function applyExistingImageSizes() {
    var queue = document.querySelector("#queue");
    if (queue) Array.prototype.forEach.call(queue.querySelectorAll("img.miniature"), forceImageSize);
  }

  function initializePremiumThumbnails() {
    if (initialized) return true;
    if (typeof queueMiniatures !== "function" || typeof $queue === "undefined" || !$queue.length) return false;

    try {
      if (typeof MINIATURES !== "undefined") MINIATURES = true;
      // Run the Premium thumbnail builder only once; repeatedly rebuilding it made images flash/disappear.
      queueMiniatures("show");
      initialized = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function processQueue() {
    addStyles();
    initializePremiumThumbnails();
    addNiconicoThumbnails();
    applyExistingImageSizes();
    hideThumbnailToggle();
  }

  function start() {
    addStyles();
    processQueue();

    var queue = document.querySelector("#queue");
    if (queue && !observer && window.MutationObserver) {
      observer = new MutationObserver(function (mutations) {
        var queueEntriesChanged = mutations.some(function (mutation) {
          var nodes = Array.prototype.slice.call(mutation.addedNodes);
          return nodes.some(function (node) {
            if (node.nodeType !== 1) return false;
            return (node.matches && node.matches("li.queue_entry, li")) ||
              (node.querySelector && !!node.querySelector("li.queue_entry, li"));
          });
        });
        if (queueEntriesChanged) {
          // Do not rebuild all thumbnails: only process newly added playlist entries.
          addNiconicoThumbnails();
          applyExistingImageSizes();
        }
      });
      observer.observe(queue, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  var retry = window.setInterval(function () {
    retryCount++;
    addStyles();
    if (!initialized) processQueue();
    else {
      addNiconicoThumbnails();
      applyExistingImageSizes();
      hideThumbnailToggle();
    }
    if (retryCount >= 60) window.clearInterval(retry);
  }, 500);
})();
