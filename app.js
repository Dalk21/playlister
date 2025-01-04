const express = require("express");
const fs = require("fs");
const path = require("path");
const { cacheSongInfo, getCachedSongInfo, manualCacheSongInfo } = require("./function");
const bodyParser = require('body-parser');
const app = express();

fs.mkdirSync(path.join(__dirname, "playlists"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "icons"), { recursive: true });

app.use(bodyParser.raw({ type: 'audio/mpeg', limit: "20mb" }));
app.use(bodyParser.raw({ type: 'image/png', limit: "20mb" }));

app.get("/api/playlists", async (req, res) => {
    let playlistObject = {};
    const playlistsDir = fs.readdirSync(path.join(__dirname, "playlists"));
    playlistsDir.forEach(playlist => {
        playlistObject[playlist] = [];
        const playlistData = fs.readdirSync(path.join(__dirname, "playlists", playlist));
        playlistData.forEach(playlistSong => {
            if(!playlistSong.endsWith(".disabled")) {
                const data = getCachedSongInfo(`${playlist}/${playlistSong.split(".")[0]}.json`);
            playlistObject[playlist].push({
                fileName: playlistSong,
                playlistId: playlist,
                filePath: path.join(__dirname, "playlists", playlist, playlistSong),
                metadata: Object(JSON.parse(data))
            });
            }
        });
    });
    res.send(playlistObject);
});

app.post("/api/playlist/:playlistName/add/advanced", async (req, res) => {
    const { songName, artist, year, album, iconUrl } = req.query;
    const playlistName = req.params.playlistName;
    fs.mkdirSync(path.join(__dirname, "playlists", playlistName), { recursive: true });
    manualCacheSongInfo(songName, artist, year, album, decodeURIComponent(iconUrl), playlistName);

    const mp3Buffer = req.body;
    const mp3Path = path.join(__dirname, "playlists", playlistName, `${songName}.mp3`);
    fs.writeFileSync(mp3Path, Buffer(mp3Buffer));

    res.status(200).send({ message: "Song added successfully!" });
});

app.post("/api/playlist/:playlistName/add", async (req, res) => {
    const { songName, artist } = req.query;
    const playlistName = req.params.playlistName;
    fs.mkdirSync(path.join(__dirname, "playlists", playlistName), { recursive: true });
    await cacheSongInfo(songName, artist, playlistName);

    const mp3Buffer = req.body;
    const mp3Path = path.join(__dirname, "playlists", playlistName, `${songName}.mp3`);
    fs.writeFileSync(mp3Path, Buffer(mp3Buffer));

    res.status(200).send({ message: "Song added successfully!" });
});

app.get("/api/song/:playlistName/:song", (req, res) => {
    res.sendFile(path.join(__dirname, "playlists", req.params.playlistName, req.params.song))
})

app.get("/playback/:playlistName", (req, res) => {
    let playlistData = fs.readdirSync(path.join(__dirname, "playlists", req.params.playlistName));

    let validFiles = playlistData.filter(p => !p.endsWith(".disabled"));

    if (validFiles.length > 0) {
        let randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
        res.sendFile(path.join(__dirname, "playlists", req.params.playlistName, randomFile));
    } else {
        res.send("empty playlist or no valid songs!")
    }
});

app.get("/api/playlist/:playlistName/remove", async (req, res) => {
    const { songName } = req.query;
    const playlistName = req.params.playlistName;

    const mp3Path = path.join(__dirname, "playlists", playlistName, `${songName}`);
    fs.renameSync(mp3Path, path.join(__dirname, "playlists", playlistName, `${songName}.disabled`))

    res.status(200).send({ message: "Song removed successfully!" });
});

app.use("/icons/", express.static("icons"))

app.post("/api/icon/add/:filename", async (req, res) => {
    const fileName = req.params.filename

    const imageBuffer = req.body;
    const imagePath = path.join(__dirname, "icons", `${fileName}.png`);
    fs.writeFileSync(imagePath, Buffer(imageBuffer));

    res.send(`/icons/${fileName}.png`)
});

app.use("/", express.static("web"))

app.listen(40005, () => {
    console.log("Server is listening on port 40005...");
});
