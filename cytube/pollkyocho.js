// 投票強調
(() => {
  // 二重起動を防止
  if (window.voteLeaderObserver) {
    window.voteLeaderObserver.disconnect();
  }

  function updateLeaders() {
    const box = document.querySelector(".random-active");
    if (!box) return;

    const options = [...box.querySelectorAll(".option")];
    const entries = options.map(el => ({
      el,
      votes: Number(el.querySelector("button")?.textContent.trim())
    })).filter(x => Number.isFinite(x.votes));

    const maxVotes = entries.length
      ? Math.max(...entries.map(x => x.votes))
      : 0;

    entries.forEach(({ el, votes }) => {
      const shouldHighlight = maxVotes > 0 && votes === maxVotes;
      if (el.classList.contains("vote-leader") !== shouldHighlight) {
        el.classList.toggle("vote-leader", shouldHighlight);
      }
    });

    // 数字が読めない選択肢などに古い強調表示を残さない
    options.forEach(el => {
      if (!entries.some(x => x.el === el) && el.classList.contains("vote-leader")) {
        el.classList.remove("vote-leader");
      }
    });
  }

  function start() {
    if (!document.body) return;

    window.voteLeaderObserver = new MutationObserver(updateLeaders);
    window.voteLeaderObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    updateLeaders();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

