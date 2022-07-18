const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "votes";
const USER = "user_id";
const VIDEO = "video_id";
const VOTE = "vote";

const table = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(VOTE, Type.Int, {
            notNull: true,
        }),
        field(VIDEO, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "videos", column: "id" },
        }),
        field(USER, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "users", column: "id" },
        }),
    ],
});

database.query(table);

async function addVote(user, video, vote) {
    const removeQuery = `DELETE FROM ${TABLE_NAME} WHERE ${USER} = '${user}' AND ${VIDEO} = '${video}'`;
    const query = `INSERT INTO ${TABLE_NAME} (${USER},${VIDEO},${VOTE}) VALUES ('${user}','${video}','${vote}')`;

    await database.query(removeQuery);

    return database.query(query);
}

async function getVideoVotes(id) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${VIDEO} = '${id}'`;

    return (await database.query(query)).rows;
}

module.exports = {
    addVote,
    getVideoVotes,
};
