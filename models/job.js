const {sqlForPartialUpdate} = require("../helpers/sql");
const db = require('../db')
const {BadRequestError, NotFoundError} = require("../expressError");
module.exports = class Job {

    static async create({title, salary, equity, companyHandle}) {
        try {
            const {rows: [job]} = await db.query(`
                INSERT INTO jobs (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, salary, equity,company_handle as "companyHandle"`, [title, salary, equity, companyHandle])
            return {job}
        } catch (e) {
            throw new BadRequestError(e.message)
        }
    }

    static async findAll(filters) {
        const {where, vals} = createFilterWhereClause(filters)

        const query = `
            SELECT id,title,salary,equity,company_handle as "companyHandle"
            FROM jobs ${where}`
        const {rows: jobs} = await db.query(query, vals)
        return {jobs}

    }

    static async get(id) {
        const {rows: [job]} = await db.query(`
            SELECT id,title,salary,equity,company_handle as "companyHandle"
            FROM jobs
            WHERE id = $1
        `, [id])
        if (!job) throw new NotFoundError()
        return {job}
    }

    static async update(id, data) {
        const {rows: [row]} = await db.query(`SELECT *
                                              FROM jobs
                                              WHERE id = $1`, [id])
        if (!row) throw new NotFoundError()

        const {setCols, values} = sqlForPartialUpdate(data, {company_handle: 'companyHandle'})
        const {rows: [job]} = await db.query(`
            UPDATE jobs
            SET ${setCols}
            WHERE id = $${
                    values.length + 1
            } RETURNING id, title,salary,equity,company_handle as "companyHandle"`, [...values, id])
        return job

    }

    static async remove(id) {

        const {rows:[row]}= await db.query(`DELETE
                        FROM jobs
                        where id = $1 RETURNING *`, [id])
        if (!row)throw new NotFoundError()
    }
}

function createFilterWhereClause(filters) {
    let where = ''
    let vals = []
    if (!filters || !Object.keys(filters).length)
        return {where, vals}
    const {title, minSalary, hasEquity} = filters
    where = []
    let i = 1
    if (title) {
        where.push(`title ILIKE $${i++} `)
        vals.push(`%${title}%`)
    }
    if (minSalary) {
        where.push(`salary >= $${i++}`)
        vals.push(minSalary)
    }
    if (hasEquity) {
        where.push(`equity != '0'`)
    }
    where = 'WHERE ' + where.join(' AND ')
    if (!hasEquity && !vals.length) where = ''

    return {where, vals}

}