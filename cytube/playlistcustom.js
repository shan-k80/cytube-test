/* ==========================================================
   CyTube プレイリスト整形 JS
   チャンネル設定 → 「Javascript / CSS」の JS 欄に貼り付け
   対になる CSS: njym_playlist.css
   やっていること:
     ① 投稿元サイトのアイコン用 <span> を追加
     ② 投稿ユーザー名を動画時間の隣に追加（匿名は空欄）
   ========================================================== */
(function () {
  "use strict";

  // CyTube内部の media.type → アイコン種別
  var TYPE_MAP = {
    yt: "yt", nico: "nico", nicovideo: "nico", vi: "vimeo", dm: "dm",
    sc: "sc", tw: "tw", gd: "gd", gdrive: "gd", fi: "file"
  };

  // type で判別できないとき用：リンク先のドメインで判別
  var HOST_MAP = [
    [/(^|\.)(youtube\.com|youtu\.be)$/i, "yt"],
    [/(^|\.)(nicovideo\.jp|nico\.ms)$/i, "nico"],
    [/(^|\.)vimeo\.com$/i, "vimeo"],
    [/(^|\.)dailymotion\.com$/i, "dm"],
    [/(^|\.)soundcloud\.com$/i, "sc"],
    [/(^|\.)twitch\.tv$/i, "tw"],
    [/(^|\.)bilibili\.com$/i, "bili"],
    [/(^|\.)drive\.google\.com$/i, "gd"]
  ];

  function detectSite(li) {
    var media = window.jQuery ? window.jQuery(li).data("media") : null;
    if (media && media.type && TYPE_MAP[media.type]) {
      return TYPE_MAP[media.type];
    }
    var a = li.querySelector(".qe_title");
    if (a && a.href) {
      try {
        var host = new URL(a.href).hostname;
        for (var i = 0; i < HOST_MAP.length; i++) {
          if (HOST_MAP[i][0].test(host)) return HOST_MAP[i][1];
        }
      } catch (e) { /* 無視 */ }
    }
    return "other";
  }

  function detectUser(li) {
    // CyTube は li の title 属性に "Added by: ユーザー名" を入れている
    var t = li.getAttribute("title") || "";
    var m = t.match(/^[^:：]*[:：]\s*(.*)$/);
    return m ? m[1].trim() : "";
  }

  function decorate(li) {
    if (!li || li.nodeType !== 1 || !li.classList.contains("queue_entry")) return;
    if (li.getAttribute("data-njym") === "1") return;
    var title = li.querySelector(".qe_title");
    var time = li.querySelector(".qe_time");
    if (!title || !time) return;           // まだ中身が出来上がっていない場合はスキップ
    li.setAttribute("data-njym", "1");

    var site = detectSite(li);
    var icon = document.createElement("span");
    icon.className = "njym-site";
    icon.setAttribute("data-site", site);
    li.insertBefore(icon, title);

    var user = document.createElement("span");
    user.className = "njym-user";
    user.textContent = detectUser(li);     // 匿名なら空文字のまま
    li.insertBefore(user, time);
  }

  function decorateAll(queue) {
    var items = queue.querySelectorAll(".queue_entry");
    for (var i = 0; i < items.length; i++) decorate(items[i]);
  }

  function start(queue) {
    decorateAll(queue);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) decorate(m.addedNodes[i]);
      });
    }).observe(queue, { childList: true });
  }

  // #queue ができるまで待つ（読み込みタイミング対策）
  var tries = 0;
  var timer = setInterval(function () {
    var q = document.getElementById("queue");
    if (q) { clearInterval(timer); start(q); }
    else if (++tries > 100) { clearInterval(timer); }   // 約20秒で諦める
  }, 200);
})();
