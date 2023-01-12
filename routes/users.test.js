"use strict";

process.env.NODE_ENV = "test"

const request = require("supertest");

const {db} = require("../db/db.js");
const app = require("../app");
const User = require("../models/user");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token, adminToken
} = require("./_testCommon");
const Job = require("../models/job");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
    test("works for users: create non-admin", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: false,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);

    });


    test("works for admins: create non-admin", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: false,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            user: {
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                email: "new@email.com",
                isAdmin: false,
            }, token: expect.any(String),
        });
    });

    test("works for admins: create admin", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: true,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            user: {
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                email: "new@email.com",
                isAdmin: true,
            }, token: expect.any(String),
        });
    });

    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: true,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "new@email.com",
                isAdmin: true,
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request if missing data", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request if invalid data", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                password: "password-new",
                email: "not-an-email",
                isAdmin: true,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /users */

describe("GET /users", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            users: [
                {
                    "email": "admin@user.com",
                    "firstName": "admin",
                    "isAdmin": true,
                    "lastName": "user",
                    "username": "admin",
                    jobs: []
                },
                {
                    username: "u1",
                    firstName: "U1F",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                    jobs: []
                },
                {
                    username: "u2",
                    firstName: "U2F",
                    lastName: "U2L",
                    email: "user2@user.com",
                    isAdmin: false,
                    jobs: [expect.any(Number)]
                },
                {
                    username: "u3",
                    firstName: "U3F",
                    lastName: "U3L",
                    email: "user3@user.com",
                    isAdmin: false,
                    jobs: []
                },

            ],
        });
    });

    test("unauth for user", async function () {
        const resp = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
    test("unauth for anon", async function () {
        const resp = await request(app)
            .get("/users");
        expect(resp.statusCode).toEqual(401);
    });

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE users CASCADE");
        const resp = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .get(`/users/u1`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
                jobs: []
            },
        });
    });

    test("works for matching user", async function () {
        const resp = await request(app)
            .get(`/users/u1`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
                jobs: []
            },
        });
    });

    test("unauth for non-matching user", async function () {
        const resp = await request(app)
            .get(`/users/u2`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);

    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .get(`/users/u1`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if user not found", async function () {
        const resp = await request(app)
            .get(`/users/nope`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
    test("works for admin", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                firstName: "New",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "New",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
            },
        });
    });


    test("works for matching", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                firstName: "New",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "New",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
            },
        });
    });
    test("unauth for non-matching user", async function () {
        const resp = await request(app)
            .patch(`/users/u2`)
            .send({
                firstName: "New",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                firstName: "New",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if no such user", async function () {
        const resp = await request(app)
            .patch(`/users/nope`)
            .send({
                firstName: "Nope",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request if invalid data", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                firstName: 42,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
    test("works: set new password", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                password: "new-password",
            })
            .set("authorization", `Bearer ${u1Token}`)

        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
            },
        });

    })
    test("works: set new password as admin", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                password: "new-password",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
            },
        });
        const isSuccessful = await User.authenticate("u1", "new-password");
        expect(isSuccessful).toBeTruthy();
    });


});
/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .delete(`/users/u1`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({deleted: "u1"});
    });
    test("works for matching user", async function () {
        const resp = await request(app)
            .delete(`/users/u1`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({deleted: "u1"});
    });

    test("unauth for non-matching user", async function () {
        const resp = await request(app)
            .delete(`/users/u2`)
            .set("authorization", `Bearer ${u1Token}`);
        ;
        expect(resp.statusCode).toEqual(401);
    });
    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/users/u1`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if user missing", async function () {
        const resp = await request(app)
            .delete(`/users/nope`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});


describe('apply', () => {
    test('apply', async () => {
        const {username} = await User.get('u1')
        const {job: {id}} = await Job.create({salary: 100000, equity: '0', companyHandle: 'c1', title: 'j1'})

        await request(app)
            .post(`/users/${username}/jobs/${id}`)
            .set("authorization", `Bearer ${adminToken}`);


        const {body: {user: actual}} = await request(app)
            .get(`/users/${username}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(actual).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "user1@user.com",
            isAdmin: false,
            jobs: [id]
        })
        await db.query(`DELETE
                        FROM applications`)

    })

    test('apply bad username', async () => {
        const user = await User.get('u1')
        const {job} = await Job.create({salary: 100000, equity: '0', companyHandle: 'c1', title: 'j1'})

        const {statusCode, body} = await request(app)
            .post(`/users/not-a-user/jobs/${job.id}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(statusCode).toBe(400)
        expect(body).toEqual({error:{message:'invalid username or job id',status:400}})
    })
    test('apply bad job', async () => {
        const user = await User.get('u1')
        const {statusCode, body} = await request(app)
            .post(`/users/${user.username}/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(statusCode).toBe(400)
        expect(body).toEqual({error:{message:'invalid username or job id',status:400}})

    })

    test('apply bad username & bad job', async () => {
        const {statusCode, body} = await request(app)
            .post(`/users/not-a-user/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(statusCode).toBe(400)
        expect(body).toEqual({error:{message:'invalid username or job id',status:400}})

    })
})
