"use strict";

process.env.NODE_ENV = "test"

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token, adminToken,
} = require("./_testCommon");
const Job = require("../models/job");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
    const newCompany = {
        handle: "new",
        name: "New",
        logoUrl: "http://new.img",
        description: "DescNew",
        numEmployees: 10,
    };

    test("ok for users", async function () {
        const resp = await request(app)
            .post("/companies")
            .send(newCompany)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            company: newCompany,
        });
    });

    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .post("/companies")
            .send(newCompany)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({
                handle: "new",
                numEmployees: 10,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({
                ...newCompany,
                logoUrl: "not-a-url",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /companies */

describe("GET /companies", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/companies");
        expect(resp.body).toEqual({
            companies:
                [
                    {
                        handle: "c1",
                        name: "C1",
                        description: "Desc1",
                        numEmployees: 1,
                        logoUrl: "http://c1.img",
                    },
                    {
                        handle: "c2",
                        name: "C2",
                        description: "Desc2",
                        numEmployees: 2,
                        logoUrl: "http://c2.img",
                    },
                    {
                        handle: "c3",
                        name: "C3",
                        description: "Desc3",
                        numEmployees: 3,
                        logoUrl: "http://c3.img",
                    },
                ],
        });
    });

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE companies CASCADE");
        const resp = await request(app)
            .get("/companies")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });

    describe('query filter params', () => {
        test("min", async function () {
            const resp = await request(app).get("/companies?minEmployees=2");
            expect(resp.body).toEqual({
                companies:
                    [
                        {
                            handle: "c2",
                            name: "C2",
                            description: "Desc2",
                            numEmployees: 2,
                            logoUrl: "http://c2.img",
                        },
                        {
                            handle: "c3",
                            name: "C3",
                            description: "Desc3",
                            numEmployees: 3,
                            logoUrl: "http://c3.img",
                        },
                    ],
            });
        });
        test("name c + min", async function () {
            const resp = await request(app).get("/companies?nameLike=c&minEmployees=2");
            expect(resp.body).toEqual({
                companies:
                    [
                        {
                            handle: "c2",
                            name: "C2",
                            description: "Desc2",
                            numEmployees: 2,
                            logoUrl: "http://c2.img",
                        },
                        {
                            handle: "c3",
                            name: "C3",
                            description: "Desc3",
                            numEmployees: 3,
                            logoUrl: "http://c3.img",
                        },
                    ],
            });
        });
        test("max", async function () {
            const resp = await request(app).get("/companies?maxEmployees=2");
            expect(resp.body).toEqual({
                companies:
                    [
                        {
                            handle: "c1",
                            name: "C1",
                            description: "Desc1",
                            numEmployees: 1,
                            logoUrl: "http://c1.img",
                        }, {
                        handle: "c2",
                        name: "C2",
                        description: "Desc2",
                        numEmployees: 2,
                        logoUrl: "http://c2.img",
                    }
                    ],
            });
        });
        test("range", async function () {
            const resp = await request(app).get("/companies?minEmployees=1&maxEmployees=2");
            expect(resp.body).toEqual({
                companies:
                    [
                        {
                            handle: "c1",
                            name: "C1",
                            description: "Desc1",
                            numEmployees: 1,
                            logoUrl: "http://c1.img",
                        }, {
                        handle: "c2",
                        name: "C2",
                        description: "Desc2",
                        numEmployees: 2,
                        logoUrl: "http://c2.img",
                    }
                    ],
            });
        });
        test("namelike one", async function () {
            const resp = await request(app).get("/companies?nameLike=c1");
            expect(resp.body).toEqual({
                companies:
                    [
                        {
                            handle: "c1",
                            name: "C1",
                            description: "Desc1",
                            logoUrl: "http://c1.img",
                        }
                    ]
            });
            });
            test("namelike all", async function () {
                const resp = await request(app).get("/companies?nameLike=c");
                expect(resp.body).toEqual({
                    companies:
                        [
                            {
                                handle: "c1",
                                name: "C1",
                                description: "Desc1",
                                logoUrl: "http://c1.img",
                            }, {
                            handle: "c2",
                            name: "C2",
                            description: "Desc2",
                            logoUrl: "http://c2.img",
                        },
                            {
                                handle: "c3",
                                name: "C3",
                                description: "Desc3",
                                logoUrl: "http://c3.img",
                            },
                        ]
            });
        });
            test("bad request extra param", async function () {
                const resp = await request(app).get("/companies?badRequest=true");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('invalid query params')
               expect(status).toBe(400)
            });
            test("bad request min", async function () {
                const resp = await request(app).get("/companies?minEmployees=0");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('bad value for employees query')
               expect(status).toBe(400)
            });
            test("bad request max", async function () {
                const resp = await request(app).get("/companies?maxEmployees=0");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('bad value for employees query')
               expect(status).toBe(400)
            });
            test("bad request max<min", async function () {
                const resp = await request(app).get("/companies?minEmployees=2&maxEmployees=1");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('invalid range for employees filter')
               expect(status).toBe(400)
            });
            test("bad request NaN both min bad", async function () {
                const resp = await request(app).get("/companies?minEmployees=a&maxEmployees=1");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('min employees is not a number')
               expect(status).toBe(400)
            });
            test("bad request NaN both max bad", async function () {
                const resp = await request(app).get("/companies?minEmployees=3&maxEmployees=a");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('max employees is not a number')
               expect(status).toBe(400)
            });
            test("bad request NaN min bad", async function () {
                const resp = await request(app).get("/companies?minEmployees=a");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('min employees is not a number')
               expect(status).toBe(400)
            })
            test("bad request NaN max bad", async function () {
                const resp = await request(app).get("/companies?maxEmployees=a");
               const {body:{error:{message,status}}}=resp
               expect(message).toBe('max employees is not a number')
               expect(status).toBe(400)
            });
    })

});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
    test("works for anon", async function () {
        await db.query(`INSERT INTO jobs (company_handle,equity,salary,title) 
        values ('c1','0',4494,'title')`)
        const resp = await request(app).get(`/companies/c1`);
        expect(resp.body).toEqual({
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
                jobs:[
                    {
                        companyHandle:'c1',
                        equity:'0',
                        salary:4494,
                        title:'title',
                        id:expect.any(Number)
                    }
                ]
            },
        });
    });

    test("works for anon: company w/o jobs", async function () {
        await Job.create({title:'title2',salary:10,equity: '0.100',companyHandle:'c2'})
        const resp = await request(app).get(`/companies/c2`);
        expect(resp.body).toEqual({
            company: {
                handle: "c2",
                name: "C2",
                description: "Desc2",
                numEmployees: 2,
                logoUrl: "http://c2.img",
                jobs:[
                    {id:expect.any(Number),title:'title2',salary:10,equity: '0.100',companyHandle:'c2'}
                ]
            },
        });
    });

    test("not found for no such company", async function () {
        const resp = await request(app).get(`/companies/nope`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
    test("works for users", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                name: "C1-new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            company: {
                handle: "c1",
                name: "C1-new",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
        });
    });
    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                name: "C1-new",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.status).toBe(401)
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                name: "C1-new",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such company", async function () {
        const resp = await request(app)
            .patch(`/companies/nope`)
            .send({
                name: "new nope",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on handle change attempt", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                handle: "c1-new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                logoUrl: "not-a-url",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
    test("works for users", async function () {
        const resp = await request(app)
            .delete(`/companies/c1`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({deleted: "c1"});
    });
    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .delete(`/companies/c1`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/companies/c1`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such company", async function () {
        const resp = await request(app)
            .delete(`/companies/nope`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});
