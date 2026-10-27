/***********************************************************************************************************************

# Synchtube Premium © 2016-2019 by ZimnyLech

# ABOUT
_______

# Synchtube Premium is a powerful JavaScript application for CyTube (or any server based on CyTube API) channels
# Multi-functional - adds to your channel over 100 missing features, functions, and enhancements
# Minimal layout interference - maximum channel boost by adding only few buttons and menus
# User-oriented - gives single user almost infinite possibilities to set layout and look of the channel
# Ready-to-use - doesn't require any configuration to work (see: INSTALLATION)
# Relatively small filesize - less than 305 kB of code

# INSTALLATION
______________

# 1. Log as an admin to your channel, and go to: Channel Settings > Admin Settings
# 2. Paste following URL to "External Javascript": https://dl.dropboxusercontent.com/s/1dyazoq6t7wh808/Premium.js
#    Installation finished!

# RELEASE
_________

# Version:		2.12.2
# Release date:		2019-03-07
# License:		Creative Commons CC-BY-NC-SA 4.0
# License URL:		http://creativecommons.org/licenses/by-nc-sa/4.0/

# API CONTENTS
______________

# [SECTION 1]		INITIAL GLOBAL VARIABLES
# [SECTION 2]		GLOBAL FUNCTIONS
# [SECTION 3]		USER INTERFACE
# [SECTION 4]		USER INTERFACE EVENTS
# [SECTION 5]		SYNCHTUBE API EXTENSION
# [SECTION 6]		IMGUR API
# [SECTION 7]		OEKAKI API
# [SECTION 8]		CSS AND FINAL LAYOUT

***********************************************************************************************************************/

// ***** API activation control ***** //

START = new Date().getTime();
setTimeout(function() {
	if (typeof LOADED === "undefined") {
		var msg = 'Synchtube Premium error! Application hasn\'t been loaded properly, some functions '
			+ 'may not work. If there\'s a problem with media player, try to refresh the page. '
			+ 'Otherwise, ask channel administrator, or disable script access.';
		addChatNotification(msg);
	}
}, 10000);

// Reload after unexpected site error (if API was already loaded), to prevent duplication of the elements
// It fixes also incompability with enabled "Chat Only" layout

if (typeof LOADED !== "undefined" || $("body").hasClass('chatOnly')) document.location.reload();


// ***** BASIC CUSTOMIZATION ***** //

/*
For advanced admins (own hosting required). Absolutely DO NOT DELETE any given variable, or the API may not work.

# FaviconURL		| URL of an optional channel favicon
# ChannelName		| custom channel name in the navigation bar instead of default server name
# MiniLogoURL		| custom mini logo in the navigation bar
			| height: 36px (logo will be automatically resized)
# CustomWelcomeText	| custom navigation bar "Welcome" message
# WelcomeSoundFileURL	| URL of an optional welcome sound file played on load
			| recommended: .ogg file (best support by browsers)
# MOTDAlteredElement	| ID of the optional specific MOTD element, that will be altered after script loading
			| e.g.: 'altered-div'
# MOTDAlteredHTML	| new HTML content of the specific MOTD element mentioned above
# AnnouncementHTML	| HTML/text of an optional announcement/message below MOTD
# JoinMessage		| "user joined" message displayed on chat
# LeaveMessage		| "user left" message displayed on chat
			| user can enable/disable displaying join/leave messages in: Premium Settings > Advanced
# NowPlaying		| "now playing" message in Radio Mode
# PlayingNext		| "playing next" message in Radio Mode
# PlayerCoveringURL	| custom URL of the player covering image for "Hide Player Until Next" function
# CustomTitleCaption	| custom title caption (default: 'Currently Playing:')
# CustomFooterHTML	| HTML or text of an optional, additional custom footer
# AnswersArray		| answers for "!ask" chat command
# FortunesArray		| prophecies for "!fortune" chat command
# SoundFiltersArray	| list of optional chat soundfilters (audio files played after sending certain text on chat)
			| syntax: 'chat_text':'sound_file_URL',
			| recommended: .ogg files (best support by browsers)
# FactsArray		| list of optional funny facts about users for undocummented "!fact" command
			| don't use usernames, user will be randomly selected from the userlist
# ImgurClientID		| imgur client ID for images upload (leave default ID if you don't have your own one)
# GiphyAPIKey		| giphy API key for images search (leave default key if you don't have your own one)
# ExternalScriptURL	| URL of
