const database = require("../database");
const { createTable, Type, field } = require("../utils");

const TABLE_NAME = "files";
const ID = "id";
const BYTES = "bytes";

const createTableQuery = createTable({
    name: TABLE_NAME,
    ifNotExists: true,
    columns: [
        field(ID, Type.Varchar(12), { primaryKey: true, notNull: true }),
        field(BYTES, Type.Bytea),
    ],
});

database.query(createTableQuery);

module.exports = {};
