const bcrypt = require("bcrypt");

const {db} = require("../db/db.js");
const createDB = require("../db/createDB");
const dropDB = require("../db/dropDB");
const {BCRYPT_WORK_FACTOR} = require("../config");

async function commonBeforeAll() {
// await db.query(`DELETE FROM applica`)
//     await db.query(`DELETE
//                     FROM users`)
//     await db.query(`DELETE
//                     FROM companies`)
//
//     await db.query(`
//
//         INSERT INTO companies(handle, name, num_employees, description, logo_url)
//         VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
//                ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
//                ('c3', 'C3', 3, 'Desc3', 'http://c3.img');
//
//         INSERT INTO users(username,
//                           password,
//                           first_name,
//                           last_name,
//                           email)
//         VALUES ('u1', '${await bcrypt.hash("password1", BCRYPT_WORK_FACTOR)}', 'U1F', 'U1L', 'u1@email.com'),
//                ('u2', '${await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)}', 'U2F', 'U2L', 'u2@email.com');
//
//     `);
//
//     let {rows: [job1, job2, job3]} = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
//                                                      VALUES ('job1', 1000, '0.080', 'c1'),
//                                                             ('job2', 2000, '0.080',
//                                                              'c2'),
//                                                             ('job3', 100000, '0',
//                                                              'c1') RETURNING id,title,salary,equity,company_handle as "companyHandle"`)


}

async function commonBeforeEach() {

    try {
        await createDB(db)
    }catch (e) {

    }
    await db.query(`DELETE
                    FROM users`)
    await db.query(`DELETE
                    FROM companies`)

    await db.query(`

        INSERT INTO companies(handle, name, num_employees, description, logo_url)
        VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
               ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
               ('c3', 'C3', 3, 'Desc3', 'http://c3.img');

        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', '${await bcrypt.hash("password1", BCRYPT_WORK_FACTOR)}', 'U1F', 'U1L', 'u1@email.com'),
               ('u2', '${await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)}', 'U2F', 'U2L', 'u2@email.com');

    `);

    let {rows: [job1, job2, job3]} = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                                                     VALUES ('job1', 1000, '0.080', 'c1'),
                                                            ('job2', 2000, '0.080',
                                                             'c2'),
                                                            ('job3', 100000, '0',
                                                             'c1') RETURNING id,title,salary,equity,company_handle as "companyHandle"`)

//     await db.query("BEGIN");
}

async function commonAfterEach() {
    // await db.query("ROLLBACK");

}

async function commonAfterAll() {
    await db.end();
}


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};