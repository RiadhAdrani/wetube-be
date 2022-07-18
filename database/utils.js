const Type = {
    Varchar: (length) => `VARCHAR(${length})`,
    Boolean: "bool",
    Int: "int",
    Bytea: "bytea",
    BigInt: "bigint",
};

const FieldOptions = {
    primaryKey: false,
    foreignKey: { table: "", column: "" },
    notNull: false,
    serial: false,
};

/**
 *
 * @param {string} name
 * @param {string} type
 * @param {typeof FieldOptions} options
 * @returns
 */
function field(name, type, options) {
    return {
        name,
        type,
        options,
    };
}

function createTable({ name = undefined, columns = [], ifNotExists = true }) {
    if (typeof name !== "string") {
        throw "Table name is not of type string";
    }

    if (!Array.isArray(columns)) {
        throw "Table columns is not of type Array";
    }

    let query = "CREATE TABLE";

    if (ifNotExists === true) {
        query += " IF NOT EXISTS";
    }

    query += ` ${name}(`;

    const fields = [];

    let trailing = "";

    columns.forEach((field, index) => {
        if (fields.includes(field.name)) throw "Duplicate field name";
        if (field.type === undefined) throw "Duplicate field name";

        fields.push(field.name);

        let f = index > 0 ? "," : "";
        f += ` ${field.name} ${field.type}`;

        if (field.options) {
            f += field.options.serial ? " SERIAL" : "";
            f += field.options.primaryKey ? " PRIMARY KEY" : "";
            f += field.options.notNull ? " NOT NULL" : "";

            if (
                field.options.foreignKey &&
                field.options.foreignKey.table &&
                field.options.foreignKey.column
            ) {
                trailing += ",";
                trailing += `FOREIGN KEY (${field.name}) REFERENCES ${field.options.foreignKey.table}(${field.options.foreignKey.column})`;
            }
        }

        query += f;
    });

    query += ` ${trailing})`;

    return query;
}

module.exports = { createTable, field, Type };
