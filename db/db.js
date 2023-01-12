"use strict";
/** Database setup for jobly. */
const {Client} = require("pg");
const {getDatabaseUri} = require("../config");
const pgp = "ag5c"+`qd${"7"+7}n`
process.env.PGPASSWORD=pgp

const connect = ()=>{
    let db;
    const connectionString=`postgresql:///${getDatabaseUri()}`
    /* istanbul ignore next */
    if (process.env.NODE_ENV === "production") {
        db = new Client({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
    } else {
        db = new Client({
            connectionString
        });
    }
    db.connect();

    return db
}

const db = connect()

const query = async (query, params = []) => {
    try {
        return await db.query(query, params)
    } catch (e) {
        // console.log('QUERY: ', query)
        throw e
    }
}
module.exports = {
    db,
    query,
    connect,
    end: async () => await db.end()
};