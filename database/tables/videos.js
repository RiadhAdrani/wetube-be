const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "videos";
const ID = "id";
const TITLE = "title";
const USERID = "user_id";
const CREATED = "created";
const LENGTH = "length";
const DESCRIPTION = "description";
const VISIBILITY = "visibility";

const createTableQuery = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(ID, Type.Varchar(12), { primaryKey: true, notNull: true }),
        field(USERID, Type.Varchar(12), {
            foreignKey: { table: "users", column: "id" },
            notNull: true,
        }),
        field(TITLE, Type.Varchar(100), { notNull: true }),
        field(LENGTH, Type.Int, { notNull: true }),
        field(CREATED, Type.BigInt, { notNull: true }),
        field(DESCRIPTION, Type.Varchar(1000)),
        field(VISIBILITY, Type.Varchar(10)),
    ],
});

database.query(createTableQuery);

async function getRandomVideos(number) {
    return (await database.query(`SELECT * FROM ${TABLE_NAME} ORDER BY RANDOM() LIMIT ${number}`))
        .rows;
}

async function getVideo(id) {
    return (await database.query(`SELECT * FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`)).rows[0];
}

function removeVideo(id) {
    const query = `DELETE FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`;

    return database.query(query);
}

function addVideo(id, userId, title, length, created, description, visibility) {
    const query = `INSERT INTO ${TABLE_NAME} (${ID},${USERID},${TITLE},${LENGTH},${CREATED},${DESCRIPTION},${VISIBILITY}) 
    VALUES ('${id}','${userId}','${title}','${length}','${created}','${description}','${visibility}')`;

    return database.query(query);
}

function editVideo(id, title, description, visibility) {
    const query = `UPDATE ${TABLE_NAME} SET ${TITLE} = '${title}', ${DESCRIPTION} = '${description}', ${VISIBILITY} = '${visibility}' WHERE ${ID} = '${id}'`;

    return database.query(query);
}

async function getUserVideos(id) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${USERID} = '${id}'`;

    return (await database.query(query)).rows;
}

module.exports = { getVideo, removeVideo, addVideo, editVideo, getUserVideos, getRandomVideos };
