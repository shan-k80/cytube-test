/* ==========================================================
   CyTube プレイリスト整形 JS
   チャンネル設定 → 「Javascript / CSS」の JS 欄に貼り付け
   対になる CSS: queue_list.css
   やっていること:
     ① 投稿元サイトのアイコン用 <span> を追加
     ② 投稿ユーザー名を動画時間の隣に追加（匿名は空欄）
     ③ 自分が投稿した動画の投稿者名に .mine クラスを付ける（色替え用）
     ④ 合計時間(#pllength)の長さに応じて data-level を付ける（色替え用）
        low: 30分未満 / mid: 30〜90分 / high: 90〜120分 / max: 120分以上
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

  // ---- ③ 自分の投稿かどうか判定して .mine を付け外し ----
  function myName() {
    // CyTube のグローバル CLIENT.name（ゲストなら Guest名）。未ログイン時は空
    return (window.CLIENT && window.CLIENT.name)
      ? String(window.CLIENT.name).toLowerCase() : "";
  }

  function markMine(el) {
    var me = myName();
    var u = (el.getAttribute("data-user") || "").toLowerCase();
    // 匿名（空欄）の投稿は対象外。名前は大文字小文字を区別せず比較
    el.classList.toggle("mine", !!me && !!u && me === u);
  }

  function markAllMine(queue) {
    var users = queue.querySelectorAll(".qlist-user");
    for (var i = 0; i < users.length; i++) markMine(users[i]);
  }

  function decorate(li) {
    if (!li || li.nodeType !== 1 || !li.classList.contains("queue_entry")) return;
    if (li.getAttribute("data-qlist") === "1") return;
    var title = li.querySelector(".qe_title");
    var time = li.querySelector(".qe_time");
    if (!title || !time) return;           // まだ中身が出来上がっていない場合はスキップ
    li.setAttribute("data-qlist", "1");

    var site = detectSite(li);
    var icon = document.createElement("span");
    icon.className = "qlist-site";
    icon.setAttribute("data-site", site);
    li.insertBefore(icon, title);

    var name = detectUser(li);
    var user = document.createElement("span");
    user.className = "qlist-user";
    user.setAttribute("data-user", name);
    user.textContent = name;               // 匿名なら空文字のまま
    li.insertBefore(user, time);
    markMine(user);
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

    // ログイン／名前確定のタイミングで判定し直す
    // （ページ読み込み直後は CLIENT.name が空のことがあるため）
    if (window.socket && typeof window.socket.on === "function") {
      window.socket.on("login", function () {
        setTimeout(function () { markAllMine(queue); }, 0);
      });
    }
    // 念のため、起動後しばらくしてからも1回判定し直す
    setTimeout(function () { markAllMine(queue); }, 3000);
  }

  // ---- ④ 合計時間の長さで #pllength に data-level を付ける ----
  function totalSeconds(text) {
    // "38:17" や "1:02:03" を秒に直す。読み取れなければ null
    var parts = String(text).trim().split(":");
    var sec = 0;
    for (var i = 0; i < parts.length; i++) {
      var n = parseInt(parts[i], 10);
      if (isNaN(n)) return null;
      sec = sec * 60 + n;
    }
    return sec;
  }

  function updateLevel(el) {
    var sec = totalSeconds(el.textContent);
    if (sec === null) return;
    var min = sec / 60;
    var level = min < 30 ? "low" : (min < 90 ? "mid" : (min < 120 ? "high" : "max"));
    if (el.getAttribute("data-level") !== level) el.setAttribute("data-level", level);
  }

  function watchTotal(el) {
    updateLevel(el);
    new MutationObserver(function () { updateLevel(el); })
      .observe(el, { childList: true, characterData: true, subtree: true });
  }

  var tries2 = 0;
  var timer2 = setInterval(function () {
    var el = document.getElementById("pllength");
    if (el) { clearInterval(timer2); watchTotal(el); }
    else if (++tries2 > 100) { clearInterval(timer2); }
  }, 200);

  // #queue ができるまで待つ（読み込みタイミング対策）
  var tries = 0;
  var timer = setInterval(function () {
    var q = document.getElementById("queue");
    if (q) { clearInterval(timer); start(q); }
    else if (++tries > 100) { clearInterval(timer); }   // 約20秒で諦める
  }, 200);
})();
