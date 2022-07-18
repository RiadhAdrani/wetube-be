const { generateID } = require("../../utils");
const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "comments";
const ID = "id";
const USER_ID = "user_id";
const VIDEO_ID = "video_id";
const COMMENT = "comment";
const CREATED = "created";

const table = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(ID, Type.Varchar(15), { primaryKey: true }),
        field(USER_ID, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "users", column: "id" },
        }),
        field(VIDEO_ID, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "videos", column: "id" },
        }),
        field(COMMENT, Type.Varchar(1000), { notNull: true }),
        field(CREATED, Type.BigInt, { notNull: true }),
    ],
});

database.query(table);

async function exist(id) {
    return (
        (await database.query(`SELECT * FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`)).rows[0] !=
        undefined
    );
}

async function add(comment, user, video, created) {
    let _exist = true;
    let id = "";

    while (_exist) {
        id = generateID();

        if (!(await exist(id))) {
            _exist = false;
        }
    }

    const query = `INSERT INTO ${TABLE_NAME} (${ID},${USER_ID},${VIDEO_ID},${COMMENT},${CREATED}) 
    VALUES ('${id}','${user}','${video}','${comment}',${created})`;

    return database.query(query);
}

async function remove(id) {
    const query = `DELETE FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`;

    await database.query(query);
}

async function getVideoComments(video) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${VIDEO_ID} = '${video}'`;

    return (await database.query(query)).rows;
}

module.exports = {
    add,
    remove,
    getVideoComments,
};
