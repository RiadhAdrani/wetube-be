const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "playlist_videos";
const PLAYLIST = "playlist_id";
const VIDEO = "video_id";

const table = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(VIDEO, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "videos", column: "id" },
        }),
        field(PLAYLIST, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "playlists", column: "id" },
        }),
    ],
});

database.query(table);

async function addToPlaylist(playlist, video) {
    const query = `INSERT INTO ${TABLE_NAME} (${PLAYLIST},${VIDEO}) VALUES ('${playlist}','${video}')`;

    return database.query(query);
}

async function removeFromPlaylist(video, playlist) {
    const query = `DELETE FROM ${TABLE_NAME} WHERE ${VIDEO} = '${video}' AND ${PLAYLIST} = '${playlist}'`;

    return await database.query(query);
}

async function getPlaylistItems(id) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${PLAYLIST} = '${id}'`;

    return (await database.query(query)).rows;
}

async function getVideoPlaylists(id) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${VIDEO} = '${id}'`;

    return (await database.query(query)).rows;
}

module.exports = { addToPlaylist, removeFromPlaylist, getPlaylistItems, getVideoPlaylists };
