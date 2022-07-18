const { makeUserData } = require("../../utils");
const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "users";
const ID = "id";
const USERNAME = "username";
const JOINED = "joined";
const DESCRIPTION = "description";
const EMAIL = "email";
const PASSWORD = "password";

const createUsersTable = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(ID, Type.Varchar(12), { primaryKey: true, notNull: true }),
        field(USERNAME, Type.Varchar(50), { notNull: true }),
        field(EMAIL, Type.Varchar(50), { notNull: true }),
        field(PASSWORD, Type.Varchar(50), { notNull: true }),
        field(JOINED, Type.BigInt, { notNull: true }),
        field(DESCRIPTION, Type.Varchar(1000)),
    ],
});

database.query(createUsersTable);

async function getAll(searchQuery) {
    let query = `SELECT * FROM ${TABLE_NAME}`;

    if (typeof searchQuery === "string" && searchQuery.length > 0) {
        query += ` WHERE LOWER(${USERNAME}) LIKE LOWER('%${searchQuery}%')`;
    }

    return (await database.query(query)).rows.map((item) => makeUserData(item));
}

function addUser({ id, email, password, username, joined }) {
    const query = `INSERT INTO ${TABLE_NAME} (${ID},${EMAIL},${PASSWORD},${USERNAME},${JOINED}) 
    VALUES ('${id}','${email}','${password}','${username}',${joined})`;

    return database.query(query);
}

async function getUsersIn(array = []) {
    if (!Array.isArray(array) || array.length == 0) return [];

    let items = "";

    array.forEach((user, index) => {
        items += index != 0 ? "," : "";
        items += `'${user}'`;
    });

    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID} in (${items})`;

    return (await database.query(query)).rows.map((user) => makeUserData(user));
}

async function getUser(id) {
    const res = (await database.query(`SELECT * FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`)).rows[0];

    return makeUserData(res);
}

async function getUserByEmail(email) {
    const res = (await database.query(`SELECT * FROM ${TABLE_NAME} WHERE ${EMAIL} = '${email}'`))
        .rows[0];

    return makeUserData(res);
}

async function getUserByCredential(email, password) {
    const res = (
        await database.query(
            `SELECT * FROM ${TABLE_NAME} WHERE ${EMAIL} = '${email}' AND ${PASSWORD} = '${password}'`
        )
    ).rows[0];

    return makeUserData(res);
}

async function updateUser(id, data) {
    if (!data) return false;
    if (Object.keys(data).length == 0) return false;

    let set = "";
    let index = 0;

    for (let key in data) {
        if ([DESCRIPTION, USERNAME, PASSWORD].includes(key)) {
            set += index > 0 ? "," : "";
            set += `${key} = '${data[key]}'`;
            index++;
        }
    }

    if (!set) return false;

    const query = `UPDATE ${TABLE_NAME} SET ${set} WHERE ${ID} = '${id}'`;

    await database.query(query);
    const newUser = await getUser(id);

    return makeUserData(newUser);
}

function deleteUser(id) {
    return database.query(`DELETE FROM ${TABLE_NAME} WHERE ${ID} = '${id}'`);
}

module.exports = {
    getUser,
    getUsersIn,
    getUserByEmail,
    getUserByCredential,
    addUser,
    getAll,
    deleteUser,
    updateUser,
};
