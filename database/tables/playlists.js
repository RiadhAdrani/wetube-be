const { generateID } = require("../../utils");
const database = require("../database");
const { createTable, Type, field } = require("../utils");
const { getPlaylistItems } = require("./playlist-videos");

const TABLE_NAME = "playlists";
const ID = "id";
const USER = "user_id";
const NAME = "name";

const table = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(ID, Type.Varchar(12), { primaryKey: true }),
        field(NAME, Type.Varchar(1000)),
        field(USER, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "users", column: "id" },
        }),
    ],
});

database.query(table);

async function getPlaylistData(id) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`;

    const res = (await database.query(query)).rows[0];

    return res;
}

async function getPlaylist(id) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`;

    const res = (await database.query(query)).rows[0];
    const items = await getPlaylistItems(id);

    res.items = items;

    return res;
}

async function addPlaylist(name, user) {
    let id = "";
    let exists = true;

    while (exists) {
        id = generateID();

        const result = await getPlaylist(id);

        if (result == undefined) exists = false;
    }

    const query = `INSERT INTO ${TABLE_NAME} (${ID},${USER},${NAME}) VALUES ('${id}','${user}','${name}')`;

    await database.query(query);

    const res = await getPlaylist(id);

    return res;
}

async function deletePlaylist(id) {
    const query = `DELETE FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`;

    return (await database.query(query)).rows[0];
}

module.exports = { getPlaylist, getPlaylistData, addPlaylist, deletePlaylist };
