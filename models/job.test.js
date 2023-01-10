process.env.NODE_ENV = 'test'
const {db} = require('../db/db')
const Company = require('./company')
const Job = require('./job')
const {NotFoundError} = require("../expressError");
let job1, job2, job3


beforeAll(async () => {
    await db.query(` DELETE
                    FROM companies`)
    await db.query(`DELETE
                    FROM jobs`)
    await Company.create({handle: 'c0', name: 'company', description: '', numEmployees: 5, logoUrl: ''})
})
beforeEach(async () => {
    job1 = (await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                           VALUES ('job1', 1000, '0.080', 'c0')
                           RETURNING id,title,salary,equity,company_handle as "companyHandle"`)).rows[0]
    job2 = (await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                           VALUES ('job2', 2000, '0.080', 'c0')
                           RETURNING  id,title,salary,equity,company_handle as "companyHandle"`)).rows[0]
    job3 = (await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                           VALUES ('job3', 100000, '0', 'c0')
                           RETURNING  id,title,salary,equity,company_handle as "companyHandle"`)).rows[0]


})
afterEach(async () => {
    await db.query(`DELETE
                    FROM jobs`)
})
afterAll(()=>db.end())
describe('jobs model', () => {
    describe('create', () => {
        test('create', async () => {
            const {job} = await Job.create({title: 'job4', companyHandle: 'c0', equity: '0', salary: 10000})
            const {rows: [created]} = await db.query(`SELECT  id,title,salary,equity,company_handle as "companyHandle"
                                                      FROM jobs
                                                      WHERE title = 'job4'`)
            expect(job).toEqual(created)
        })
        test('throws BadRequestError if fields are not correct', async () => {
            try {
                await Job.create({title: 'job4', companyHandle: 'c0', equity: '0', salary: '10000'})
                throw new Error()
            } catch (e) {
                if (e.message === 'fail') throw e
                expect(true).toBeTruthy()
            }
        })
    })
    describe('retrieve', () => {
        test('get one', async () => {
            const {job} = await Job.get(job1.id)
            expect(job).toEqual(job1)
        })
        test('throws NotFoundError if not found', async () => {
            try {
                await Job.get(0)
                throw new Error("fail")
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError)
            }
        })

        describe('filter', () => {
            test('filter minSalary', async () => {
                const {jobs} = await Job.findAll({minSalary: 10000})
                expect(jobs).toEqual([job3])
            })
            test('filter hasEquity', async () => {

                const {jobs} = await Job.findAll({hasEquity: true})
                expect(jobs).toEqual([job1, job2])
            })
            test('filter title', async () => {

                const {jobs} = await Job.findAll({title: 'b1'})
                expect(jobs).toEqual([job1])
            })
            test('filter title + hasEquity', async () => {

                const {jobs} = await Job.findAll({title: 'b1', hasEquity: true})
                expect(jobs).toEqual([job1])
            })
            test('filter title + hasEquity=false', async () => {

                const {jobs} = await Job.findAll({title: 'b1', hasEquity: false})
                expect(jobs).toEqual([job1])
            })
            test('filter title + minSalary', async () => {

                const {jobs} = await Job.findAll({title: 'job', minSalary: 1500})
                expect(jobs).toEqual([job2, job3])
            })
            test('filter minSalary + hasEquity', async () => {
                const {jobs} = await Job.findAll({hasEquity: true, minSalary: 1500})
                expect(jobs).toEqual([job2])
            })
            test('filter all', async () => {
                const {jobs} = await Job.findAll({hasEquity: true, minSalary: 1500, title: 'ob'})
                expect(jobs).toEqual([job2])
            })
        })
    })
    describe('update', () => {
        test('update one', async () => {
            const updated = await Job.update(job1.id, {title: 'JOB1'})
            expect(updated).toEqual({...job1, title: "JOB1"})
        })
        test('update many', async () => {
                const updated = await Job.update(job1.id, {title: 'JOB1', equity: '0'})
                expect(updated).toEqual({...job1,title: 'JOB1', equity: '0'})

        })
        test('cannot update id', async () => {
            try {
                await Job.update(job1, {id: 0})
            } catch (e) {
                console.log(e)
            }
        })
        test('throws NotFoundError if not found', async () => {
            try {
                await Job.update(0, {title: 'JOB1', equity: '0'})
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError)
            }

        })

    })
    describe('delete', () => {
        test('delete one', async () => {
            await Job.remove(job1.id)
            const {rows:[row]}= await db.query(`SELECT * FROM jobs WHERE id=$1`,[job1.id])
            expect(row).toBeFalsy()
        })
        test('throws NotFoundError if not found', async () => {
            try {
                await Job.remove(0)
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundError)
            }
        })
    })
})
