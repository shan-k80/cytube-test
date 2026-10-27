// 登録欄調整

(function () {
  const buttonGroup = document.querySelector("#plcontrol");
  const menuIds = [
    "#addfromurl",
    "#searchcontrol",
    "#addfromupload",
    "#customembed",
    "#playlistmanager"
  ];

  if (!buttonGroup) {
    console.warn("ボタングループ #plcontrol が見つかりません");
    return;
  }

  menuIds.forEach(function (id) {
    const menu = document.querySelector(id);
    if (menu) {
      buttonGroup.insertAdjacentElement("afterend", menu);
    } else {
      console.warn("メニューが見つかりません:", id);
    }
  });
})();
