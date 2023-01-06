"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

/* istanbul ignore next */
if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}

db.connect();
const query= async (query, params=[] ) => {
   try{
     return await db.query(query,params)
   }catch (e){
     console.log('QUERY: ',query)
     throw e
   }
}
module.exports = { query};