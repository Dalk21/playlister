# playlister
Playlister is a system based off the node.js framework that uses an express web server to automatically handle playlist automation for live streams and other things.

By default, it hosts itself on localhost:40005, which can be changed at the bottom of app.js.

Important URLs:
* Stream Overlay: /overlay?playlist=(playlist name)&visualizer=(true/false)&color=(visualizer color, use any color name, "rainbow" is an option)
* Home Web Panel: /
* Advanced Song Uploader: /advanced
* Random song from playlist: /playback/(playlist name)
