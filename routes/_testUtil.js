const db = require("../db");
const {adminToken} = require("./_testCommon");
const request = require("supertest");
const app = require("../app");
const deleteFromJobs = async () => await db.query(`DELETE
                                                   FROM jobs`)
const deleteFromCompanies = async () => await db.query(` DELETE
                                                         FROM companies`)
module.exports = (root)=>({
    deleteFromJobs,
    deleteFromCompanies,
    $: {

        async create(payload, token = adminToken) {
            return await request(app).post(`/${root}`).send(payload).set("authorization", `Bearer ${token}`)
        },
        async get(param, token = adminToken) {
            return await request(app).get(`/${root}/${param}`).set("authorization", `Bearer ${token}`)
        },
        async all(query = '', token = adminToken) {
            return await request(app).get(`/${root}${query}`).set("authorization", `Bearer ${token}`)
        },
        async post(payload, token = adminToken) {
            return await request(app).post(`/${root}`).send(payload).set("authorization", `Bearer ${token}`)
        },
        async patch(id, payload, token = adminToken) {
            return await request(app).patch(`/${root}/${id}`).send(payload).set("authorization", `Bearer ${token}`)
        },
        async delete(id, token = adminToken) {
            return await request(app).delete(`/${root}/${id}`).set("authorization", `Bearer ${token}`)
        }
    }
})