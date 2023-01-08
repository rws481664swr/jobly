const db = require('../db')
const Job = require('../models/job')
const app = require('../app')
const request = require('supertest')
let job1, job2, job3

const {
    u1Token,
    adminToken,
    commonAfterAll,
    commonAfterEach,
    commonBeforeAll,
    commonBeforeEach
} = require('./_testCommon')
const Company = require("../models/company");
const {deleteFromCompanies, deleteFromJobs, $} = require('./_testUtil')('jobs')
const createJobs = async function () {
    const companyHandle = 'c1'
    job1 = (await Job.create({title: 'job1', salary: 1000, equity: '0.080', companyHandle})).job
    job2 = (await Job.create({title: 'job2', salary: 2000, equity: '0.080', companyHandle})).job
    job3 = (await Job.create({title: 'job3', salary: 100000, equity: '0', companyHandle})).job
}
jest.setTimeout(7000)

beforeAll(async function () {
    await commonBeforeAll()
    await deleteFromJobs()
})

beforeEach(async () => {
    await commonBeforeEach()
    await createJobs()
})
afterEach(async () => {
    await commonAfterEach()
    await deleteFromJobs();

})
afterAll(commonAfterAll)


describe('jobs routes', () => {
    describe("create", () => {
        test('create', async () => {
            const {body: {job}} = await $.create({title: 'job4', salary: 100, equity: '0.001', companyHandle:'c1'})

            const {rows: [row]} = await db.query(`SELECT id, title, salary, equity, company_handle as "companyHandle"
                                                  FROM jobs
                                                  WHERE id = ${job.id}`)
            expect(job).toEqual(row)
        })
        test('not enough data - bad request', async () => {

            const {body:{error:{message:[msg]}}} = await $.create({title: 'job4', equity: '0.001', companyHandle: 'c1'})

            expect(msg).toEqual('instance requires property "salary"')
        })
        test('user cannot create job', async () => {

            const {statusCode} = await $.create({
                title: 'job4',
                salary: 100,
                equity: '0.001',
                companyHandle: 'c0'
            }, u1Token)
            expect(statusCode).toBe(401)
        })
    })
    describe("retrieve", () => {
        test('get /:id', async () => {
            const {body: {job}, statusCode} = await $.get(job1.id)
            expect(statusCode).toBe(200)
            expect(job).toEqual(job1)
        })
        test('get /:id 404', async () => {
            const {statusCode} = await $.get(0)
            expect(statusCode).toBe(404)
        })
        test('get all', async () => {
            const {body: {jobs}, statusCode} = await $.get(job1.id)
            const {rows: expected} = await Job.findAll()
            expect(statusCode).toBe(200)
            expect(jobs).toBe(expected)
        })
        describe('filters', () => {

            test('title', async () => {
                const {body: {jobs}, statusCode} = await $.all('?title=b1')

                const {jobs: expected} = await Job.findAll({title: 'b1'})
                expect(statusCode).toBe(200)
                expect(jobs).toEqual(expected)
            })
            test('minSalary', async () => {
                const {body: {jobs}, statusCode} = await $.all('?minSalary=1500')

                const {jobs: expected} = await Job.findAll({minSalary: 1500})
                expect(statusCode).toBe(200)
                expect(jobs).toEqual(expected)
            })
            test('equity', async () => {
                const {body: {jobs}, statusCode} = await $.all('?hasEquity=true')

                const {jobs: expected} = await Job.findAll({hasEquity: true})
                expect(statusCode).toBe(200)
                expect(jobs).toEqual(expected)
            })


            test('title + equity', async () => {
                const {body: {jobs}, statusCode} = await $.all('?title=job&hasEquity=true')

                const {jobs: expected} = await Job.findAll({title: 'job', hasEquity: true})
                expect(statusCode).toBe(200)
                expect(jobs).toEqual(expected)
            })

            test('title + minSalary', async () => {
                const {body: {jobs}, statusCode} = await $.all('?title=job&minSalary=1500')

                const {jobs: expected} = await Job.findAll({title: 'job', minSalary: 1500})
                expect(statusCode).toBe(200)
                expect(jobs).toEqual(expected)
            })

            test('minSalary + equity', async () => {
                const {body: {jobs}, statusCode} = await $.all('?hasEquity=true&minSalary=1500')

                const {jobs: expected} = await Job.findAll({hasEquity: true, minSalary: 1500})
                expect(statusCode).toBe(200)
                expect(jobs).toEqual(expected)
            })


        })
    })
    describe("update", () => {
        test('update', async () => {
            const {body: {job}, statusCode} = await $.patch(job1.id, {salary: 0})
            expect(statusCode).toBe(200)
            expect(job).toEqual({...job1, salary: 0})

        })
        test('404', async () => {
            const {statusCode} = await $.patch(0, {salary: 0})
            expect(statusCode).toBe(404)
        })
        test('user cannot update job', async () => {
            const {statusCode} = await $.patch(job1.id, {salary: 0}, u1Token)
            expect(statusCode).toBe(401)
        })

    })
    describe("remove", () => {
        test('delete', async () => {
            const {body:{message}, statusCode} = await $.delete(job1.id)
            expect(message).toBe('deleted')
            expect(statusCode).toBe(200)
            const {rows: [row]} = await db.query(`SELECT *
                                                  FROM jobs
                                                  WHERE id = $1`, [job1.id])
            expect(row).toBeUndefined()
        })
        test('404', async () => {
            const { statusCode} = await $.delete(0)
            expect(statusCode).toBe(404)


        })
        test('user cannot delete job', async () => {
            const { statusCode} = await $.delete(job1.id,u1Token)
            expect(statusCode).toBe(401)
        })

    })
})

