const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "views";
const USER = "user_id";
const VIDEO = "video_id";

const table = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(VIDEO, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "videos", column: "id" },
        }),
        field(USER, Type.Varchar(12), {
            notNull: true,
        }),
    ],
});

database.query(table);

async function addView(user, video) {
    const query = `INSERT INTO ${TABLE_NAME} (${USER},${VIDEO}) VALUES ('${user}','${video}')`;

    return database.query(query);
}

async function getVideoViews(id) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${VIDEO} = '${id}'`;

    return (await database.query(query)).rows.length;
}

module.exports = {
    addView,
    getVideoViews,
};
