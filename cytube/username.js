// メディアユーザ名表示
if(!Callbacks.changeMedia2){
    Callbacks.changeMedia2 = Callbacks.changeMedia;
    if(hasPermission("seeplaylist")){
        var li = playlistFind(PL_CURRENT);
        if ($(li).attr("data-original-title")) {
            $('#currenttitle').append(" / " + $(li).attr("data-original-title"));
        }
        else if ($(li).attr("title")) {
            $('#currenttitle').append(" / " + $(li).attr("title"));
        }
    }
}
Callbacks.changeMedia = function(data){
    if(hasPermission("seeplaylist")){
        var li = playlistFind(PL_CURRENT);
        if ($(li).attr("data-original-title")) {
            data.title += " / " + $(li).attr("data-original-title");
        }
        else if ($(li).attr("title")) {
            data.title += " / " + $(li).attr("title");
        }
    }
    Callbacks.changeMedia2(data);
};
