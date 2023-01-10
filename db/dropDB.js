module.exports = async (db)=>{
    await db.query(`
DROP TABLE applications;
DROP TABLE users;
DROP TABLE jobs;
DROP TABLE companies;
    
    `)
}