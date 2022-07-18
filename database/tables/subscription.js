const { generateID } = require("../../utils");
const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "subscriptions";
const ID = "id";
const SOURCE = "source";
const TARGET = "target";

const table = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(ID, Type.Varchar(12), { primaryKey: true }),
        field(SOURCE, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "users", column: "id" },
        }),
        field(TARGET, Type.Varchar(12), {
            notNull: true,
            foreignKey: { table: "users", column: "id" },
        }),
    ],
});

database.query(table);

async function exist(id) {
    return (
        (await database.query(`SELECT * FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`)).rows[0] !=
        undefined
    );
}

async function relationExists(source, target) {
    return (
        (
            await database.query(
                `SELECT * FROM ${TABLE_NAME} WHERE ${SOURCE} = '${source}' AND ${TARGET} = '${target}'`
            )
        ).rows[0] != undefined
    );
}

async function add(source, target) {
    let _exist = true;
    let id = "";

    while (_exist) {
        id = generateID();

        if (!(await exist(id))) {
            _exist = false;
        }
    }

    const query = `INSERT INTO ${TABLE_NAME} (${ID},${SOURCE},${TARGET}) 
    VALUES ('${id}','${source}','${target}')`;

    return database.query(query);
}

async function remove(source, target) {
    const query = `DELETE FROM ${TABLE_NAME} WHERE ${TARGET} = '${target}' AND ${SOURCE} = '${source}'`;

    await database.query(query);
}

async function getSubscribers(target) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${TARGET} = '${target}'`;

    return (await database.query(query)).rows;
}

async function getSubscription(source) {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${SOURCE} = '${source}'`;

    return (await database.query(query)).rows;
}

module.exports = {
    add,
    remove,
    getSubscribers,
    getSubscription,
    relationExists,
};
