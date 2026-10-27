// emote（画像拡張子のURLを<img>タグ等に変換する）
window.execEmotes2 = window.execEmotes2 ? window.execEmotes2 : window.execEmotes;
window.execEmotes = function(msg){
    if (!USEROPTS.strip_image) {
    // jpg,jpeg,gif,png
    msg = msg.replace(/(https?:\/\/[^\?&#<>]+?\.(jpg|jpeg|gif|png))(?=[\s<]|$)/g,
          "<img class=\"channel-emote\" src=\"$1\" title=\"$1\" referrerpolicy=\"no-referrer\" />");
    // gifv(imgurなどで変換される動画)
    msg = msg.replace(/((https?:\/\/[^\?&#<>]+?)\.(gifv))(?=[\s<]|$)/g,
          "<video class=\"channel-emote\" title=\"$1\" preload=\"\" muted=\"\" loop=\"\" autoplay=\"\" style=\"vertical-align: middle;\">"+
          "<source src=\"$2.webm\" type=\"video\/webm\" />"+
          "<source src=\"$2.mp4\" type=\"video\/mp4\" />"+
          "<\/video>");
    }
    return execEmotes2(msg);
}
// 既存の過去ログ変換処理
$('#messagebuffer').html(execEmotes($('#messagebuffer').html()));
