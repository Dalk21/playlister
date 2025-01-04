const fs = require('fs');
const path = require('path');
const fetch = require("node-fetch")

const ITUNES_URL = 'https://itunes.apple.com/search';

async function fetchSongInfo(songName, artist) {
    try {
        const url = new URL(ITUNES_URL);
        url.searchParams.append('term', `${songName} ${artist}`);
        url.searchParams.append('media', 'music');
        url.searchParams.append('entity', 'song');
        url.searchParams.append('limit', '1');
        url.searchParams.append('explicit', 'false');

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch song data from iTunes');
        }

        const data = await response.json();

        const track = data.results[0];

        if (!track) {
            console.log('Song not found.');
            return null;
        }

        const songInfo = {
            songName: track.trackName,
            artist: track.artistName,
            album: track.collectionName,
            duration: track.trackTimeMillis / 1000,
            year: track.releaseDate ? new Date(track.releaseDate).getFullYear() : 'Unknown',
            iconUrl: String(track.artworkUrl100).replace("100x100", "500x500"),
        };

        return songInfo;
    } catch (error) {
        console.error('Error fetching song data:', error);
        return null;
    }
}

async function cacheSongInfo(songName, artist, playlistName) {
    const cacheDir = path.join(__dirname, 'cache', playlistName);
    const cacheFilePath = path.join(cacheDir, `${songName}.json`);
    if(fs.existsSync(cacheFilePath)) {
        return fs.readFileSync(cacheFilePath, "utf8")
    } else {
        const songInfo = await fetchSongInfo(songName, artist);

    if (!songInfo) {
        console.log('No data available to cache.');
        return;
    }

    fs.mkdirSync(cacheDir, { recursive: true });

    fs.writeFileSync(cacheFilePath, JSON.stringify(songInfo, null, 2));

    return fs.readFileSync(cacheFilePath, "utf8")
    }
}

function manualCacheSongInfo(songName, artist, year, album, iconUrl, playlistName) {
    const cacheDir = path.join(__dirname, 'cache', playlistName);
    const cacheFilePath = path.join(cacheDir, `${songName}.json`);
    if(fs.existsSync(cacheFilePath)) {
        return fs.readFileSync(cacheFilePath, "utf8")
    } else {
        const data = {
            songName: songName,
            artist: artist,
            album: album,
            duration: 0,
            year: year,
            iconUrl: iconUrl
        }
    fs.mkdirSync(cacheDir, { recursive: true });

    fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2));

    return fs.readFileSync(cacheFilePath, "utf8")
    }
}

function getCachedSongInfo(file) {
    const filePath = path.join(__dirname, "cache", file)
    return fs.readFileSync(filePath, "utf8")
}

module.exports = {cacheSongInfo,getCachedSongInfo,manualCacheSongInfo}