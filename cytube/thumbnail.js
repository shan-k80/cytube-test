(function () {
  "use strict";
 
  // Synchtube Premium標準のサムネイル機能を停止し、独立した40×27px表示に置き換える。
  // 対応: YouTube(yt) / Dailymotion(dm) / ニコニコ動画(nv)
  var STYLE_ID = "custom-miniatures-40x27-style";
  var OWN_CLASS = "custom-playlist-thumbnail";
  var observer = null;
  var busy = false;
 
  function addStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent =
      "#queue img." + OWN_CLASS + "{" +
      "width:40px!important;height:27px!important;" +
      "min-width:40px!important;min-height:27px!important;" +
      "max-width:40px!important;max-height:27px!important;" +
      "object-fit:cover!important;box-sizing:border-box!important;" +
      "vertical-align:middle!important;}";
  }
 
  function getMedia(item) {
    if (window.jQuery) {
      var media = window.jQuery(item).data("media");
      if (media && typeof media === "object") return media;
    }
    return null;
  }
 
  function getThumbnailUrl(media) {
    if (!media || !media.id) return "";
    var id = String(media.id);
    if (media.type === "yt") return "https://img.youtube.com/vi/" + encodeURIComponent(id) + "/1.jpg";
    if (media.type === "dm") return "https://www.dailymotion.com/thumbnail/video/" + encodeURIComponent(id);
    if (media.type === "nv") {
      // sm / nm + 数字のIDのみ対応（so始まりは対象外）
      var nico = id.match(/^(?:sm|nm)(\d+)$/);
      if (nico) return "https://nicovideo.cdn.nimg.jp/thumbnails/" + nico[1] + "/" + nico[1];
    }
    return "";
  }
 
  function addThumbnail(item) {
    // 取得に失敗した行は再試行しない（MutationObserverとの無限ループ防止）
    if (!item || item.dataset.customThumbFailed || item.querySelector("img." + OWN_CLASS)) return;
    var media = getMedia(item);
    var url = getThumbnailUrl(media);
    if (!url) return;
 
    var img = document.createElement("img");
    img.className = OWN_CLASS;
    img.alt = "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
 
    // ニコニコは取得失敗時に別サイズ(.M, .L)を順に試し、全滅なら諦める
    var fallbacks = media.type === "nv" ? [".M", ".L"] : [];
    img.onerror = function () {
      if (fallbacks.length) {
        img.src = url + fallbacks.shift();
      } else {
        item.dataset.customThumbFailed = "1";
        img.remove();
      }
    };
    img.src = url;

    var buttonGroup = item.querySelector(".btn-group");
    if (buttonGroup && !(window.USEROPTS && window.USEROPTS.qbtn_idontlikechange)) {
      buttonGroup.parentNode.insertBefore(img, buttonGroup);
    } else {
      item.appendChild(img);
    }
  }
 
  function render() {
    if (busy) return;
    var queue = document.querySelector("#queue");
    if (!queue) return;
    busy = true;
    try {
      // Native thumbnails are removed; our images use a different class.
      queue.querySelectorAll("img.miniature").forEach(function (img) { img.remove(); });
      queue.querySelectorAll("li").forEach(addThumbnail);
      var toggle = document.querySelector("#pls-10");
      if (toggle) {
        var menuItem = toggle.closest("li");
        if (menuItem) menuItem.style.display = "none";
      }
    } finally {
      busy = false;
    }
  }
 
  function disableNativeFeature() {
    // Prevent later Synchtube Premium rebuilds from recreating its own thumbnails.
    if (typeof window.queueMiniatures === "function" && !window.queueMiniatures.__customDisabled) {
      var noOp = function () {};
      noOp.__customDisabled = true;
      window.queueMiniatures = noOp;
    }
    if (typeof window.MINIATURES !== "undefined") window.MINIATURES = false;
  }
 
  function start() {
    addStyle();
    disableNativeFeature();
    render();
 
    var queue = document.querySelector("#queue");
    if (queue && window.MutationObserver && !observer) {
      observer = new MutationObserver(function () {
        disableNativeFeature();
        addStyle();
        render();
      });
      observer.observe(queue, { childList: true, subtree: true });
    }
 
    // Handles cases where this script loads before Synchtube Premium finishes initializing.
    var attempts = 0;
    var retry = window.setInterval(function () {
      attempts++;
      addStyle();
      disableNativeFeature();
      render();
      if (attempts >= 30) window.clearInterval(retry);
    }, 500);
  }
 
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
 
